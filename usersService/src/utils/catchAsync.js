const publishLog = require('../queue/publisher/logPublisher');

function catchAsync(fn) {
  return (call, callback) => {
    fn(call, callback).catch(async (err) => {
      try {
        await publishLog('error', {
          userId: null,
          email: '',
          error: err.message,
          date: new Date().toISOString()
        });
      } catch (logError) {
        console.error('Error al publicar en el log:', logError);
      }

      console.error(err);

      callback({
        code: err?.code || 13,
        message: err?.message || 'Internal server error'
      });
    });
  };
}

module.exports = catchAsync;
