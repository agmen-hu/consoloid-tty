defineClass('Consoloid.Tty.PtyProcess', 'Consoloid.OS.Process',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        writeable: true,
        webSocketEventToEmitOnData: undefined
      }, options));

      this.spawn = require('pty.js').spawn;
      this._waitpid = require('waitpid');
    },

    setCommand: function(cmd)
    {
      this.command = cmd;
    },

    setArgs: function(args)
    {
      this.args = args;
    },

    setWebSocketEventToEmitOnData: function(eventName)
    {
      this.webSocketEventToEmitOnData = eventName;
    },

    __bindEventCallbacks: function()
    {
      this.childProcess.on('data', this.__receivePtyData.bind(this));
      this.childProcess.on('exit', this.__handleChildProcessExit.bind(this));
      this.childProcess.on('error', this.__handleChildProcessError.bind(this));
    },

    __receivePtyData: function(data)
    {
      if (this.webSocketEventToEmitOnData !== undefined) {
        this.get('async_rpc_handler_server').getSocket()
          .emit(this.webSocketEventToEmitOnData, data);
      }
    },

    __handleChildProcessExit: function (code) {
      this.isRunning = false;
      this.onClose(code);
      this.childProcess.end();
      this._waitpid(this.childProcess.pid);
      delete this.childProcess;
    },

    __handleChildProcessError: function (error) {
      if (error.message == 'spawn ENOENT') {
        this.isRunning = false;
      }
      this.onError(error);
    },

    resize: function(rows, cols)
    {
      this.childProcess.resize(rows, cols);
    },

    write: function(data)
    {
      if (this.writeable) {
        this.childProcess.write(data);
      }
    }
  }
);