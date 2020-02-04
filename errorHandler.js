exports.internalErrorHandler = (err, req, res, next) => {
  if (err.status && err.msg) {
    // console.log("ERROR TRIGGERED - source: intenally generated");
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};
exports.psqlError = (err, req, res, next) => {
  if (err.code) {
    // console.log("ERROR TRIGGERED - source: psql" + err.code);
    const psqlErrorCodes = {
      "22P02": { status: 400, msg: "bad request" },
      "23503": { status: 404, msg: "not found" }
    };

    if (psqlErrorCodes[err.code] !== undefined) {
      res
        .status(psqlErrorCodes[err.code].status)
        .send({ msg: psqlErrorCodes[err.code].msg });
    } else next(err);
  } else next(err);
};

exports.genericError = (err, req, res, next) => {
  res.status(500).send({ msg: "internal server error" });
};

//invoked directly - not part of the error handler chain
exports.unauthorisedMethod = (req, res, next) => {
  // console.log("ERROR TRIGGERED - source: method not present");
  res.status(405).send({ msg: "method not allowed" });
};
