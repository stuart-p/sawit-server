exports.internalErrorHandler = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};
exports.psqlError = (err, req, res, next) => {
  if (err.code) {
    const psqlErrorCodes = {
      "22P02": { status: 400, msg: "bad request" },
      "23503": { status: 404, msg: "not found" },
      "42703": {
        status: 400,
        msg: "bad request - query incorrectly formatted"
      },
      "23505": { status: 400, msg: "bad request - key already exists" }
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

exports.unauthorisedMethod = (req, res, next) => {
  res.status(405).send({ msg: "method not allowed" });
};
