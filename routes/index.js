const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  await res.redirect("/main");
});

module.exports = router;
