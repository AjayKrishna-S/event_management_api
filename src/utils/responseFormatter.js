const responseFormatter = (data = {}, statusCode = 200, message = null,token =null) => {
  return {
      session: {
          token: token,
          validity: 0,
          specialMessage: null
      },
      data: data,
      status: {
          code: statusCode,
          status: statusCode >= 400 ? "Error" : "Success",
          message: message || (statusCode === 200 ? "Request successful" : "An error occurred")
      }
  };
};

module.exports = responseFormatter;
