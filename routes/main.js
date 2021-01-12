const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const Courier = require("../models/courier");
const Client = require("../models/client");
const Order = require("../models/order");

const saltRounds = 10;

router.get("/", async (req, res) => {
  const tmpOrders = await Order.find();
  const orders = [];
  for (const ord of tmpOrders) {
    if (ord.redeemed === "Not") {
      orders.push(ord);
    }
  }
  await res.render("main/index", { orders });
});

// регистраиция клиента
router
  .route("/signupclient")

  .get(async (req, res) => {
    await res.render("main/signupclient");
  })

  .post(async (req, res) => {
    const { username, email, password, telephone, address } = req.body;
    if (
      (await Client.findOne({ username })) &&
      (await Client.findOne({ email }))
    ) {
      await res.redirect("/main/loginclient");
    }
    const client = await new Client({
      username,
      email,
      password: await bcrypt.hash(password, saltRounds),
      telephone,
      address,
    });
    await client.save();
    req.session.client = client;
    await res.redirect("/main");
  });

// регистраиция курьера
router
  .route("/signupcourier")

  .get(async (req, res) => {
    await res.render("main/signupcourier");
  })

  .post(async (req, res) => {
    const { username, email, password, company } = req.body;
    if (
      (await Courier.findOne({ username })) &&
      (await Courier.findOne({ email }))
    ) {
      await res.redirect("/main/logincourier");
    }
    const courier = new Courier({
      username,
      email,
      password: await bcrypt.hash(password, saltRounds),
      company,
    });
    await courier.save();
    req.session.courier = courier;
    await res.redirect("/");
  });

// вход для клиента
router
  .route("/loginclient")

  .get(async (req, res) => {
    await res.render("main/loginclient");
  })

  .post(async (req, res) => {
    const { username, password } = req.body;
    const client = await Client.findOne({ username });
    if (client && (await bcrypt.compare(password, client.password))) {
      req.session.client = client;
      await res.redirect("/main");
    } else {
      await res.redirect("/main/signupclient");
    }
  });

// вход для курьера
router
  .route("/logincourier")

  .get(async (req, res) => {
    await res.render("main/logincourier");
  })

  .post(async (req, res) => {
    const { username, password } = req.body;
    const courier = await Courier.findOne({ username });
    if (courier && (await bcrypt.compare(password, courier.password))) {
      req.session.courier = courier;
      await res.redirect("/main");
    } else {
      await res.redirect("/main/signupcourier");
    }
  });

// выход для кого угодно
router.get("/logout", async (req, res, next) => {
  if (req.session.client || req.session.courier) {
    await req.session.destroy();
    res.clearCookie("client");
    await res.redirect("/");
  } else {
    await res.redirect("/main");
  }
});

router.get("/cabinet", async (req, res, next) => {
  if (req.session.client) {
    await res.redirect("/main/clientcabinet");
  } else if (req.session.courier) {
    await res.redirect("/main/couriercabinet");
  }
});

// кабинет клиента
router
  .route("/clientcabinet")

  .get(async (req, res) => {
    const client = await Client.findById(req.session.client._id);
    const orders = [];
    client.orders.forEach(async (element) => {
      orders.push(await Order.findById(element));
    });
    await res.render("main/clientcabinet", { name: client.username, orders });
  });

// кабинет курьера
router
  .route("/couriercabinet")

  .get(async (req, res) => {
    const courier = await Courier.findById(req.session.courier._id);
    const orders = [];
    courier.orders.forEach(async (element) => {
      orders.push(await Order.findById(element));
    });
    await res.render("main/couriercabinet", { name: courier.username, orders });
  });

// создание нового заказа(из курьерского кабинета)
router
  .route("/newOrder")

  .post(async (req, res) => {
    const { name, price, discount } = req.body;
    const data = {
      burger:
        "https://cdn.pixabay.com/photo/2016/03/05/19/02/hamburger-1238246__340.jpg",
      pizza:
        "https://smactus.top/image/cache/catalog/categories/pizza-smactus-500x500.jpg",
      sushi:
        "https://www.xarakiri.ru/upload/iblock/15d/15d81077c115b031de5b6721d3198648.jpg",
      soup:
        "https://cdn.pixabay.com/photo/2019/02/22/23/50/goulash-4014661_960_720.jpg",
      kebab:
        "https://cdn.pixabay.com/photo/2014/04/29/13/25/shish-kebab-334386_960_720.jpg",
      doner:
        "https://cdn.pixabay.com/photo/2016/10/19/18/25/doner-kebab-1753615_960_720.jpg",
    };
    const url = data[name];
    const order = new Order({
      name,
      price,
      discount,
      newPrice: Math.round(price * ((100 - discount) / 100)),
      redeemed: "Not",
      image: url,
    });
    await order.save();
    const courier = await Courier.findById(req.session.courier._id);
    courier.orders.push(order.id);
    await courier.save();
    res.redirect("/");
  });

// выкуп продукта
router
  .route("/redeem/:id")

  .post(async (req, res) => {
    if (req.session.client) {
      const { id } = req.params;
      const order = await Order.findById(id);
      const client = await Client.findById(req.session.client._id);
      client.orders.push(id);
      order.redeemed = "redeemed";
      await order.save();
      await client.save();
      res.json({ session: true });
    } else {
      res.json({ session: false });
    }
  });

router
  .route("/delivered/:id")

  .post(async (req, res) => {
    const { id } = req.params;
    const client = await Client.findById(req.session.client._id);
    const couriers = await Courier.find();
    for (const courier of couriers) {
      const index = courier.orders.indexOf(id);
      if (index !== -1) {
        await courier.orders.splice(index, 1);
        await courier.save();
        break;
      }
    }
    await client.orders.splice(client.orders.indexOf(id), 1);
    await client.save();
    await Order.findByIdAndDelete(id);
    res.redirect("/main/clientcabinet");
  });
module.exports = router;
