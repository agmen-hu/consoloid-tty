defineClass('Consoloid.Tty.TerminalWidget', 'Consoloid.Widget.Widget',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        templateId: 'Consoloid-Tty-TerminalWidget'
      }, options));

      this.__loadTermJs();
      this.__createEmulator();
      this.__createUniqueId();
    },

    __loadTermJs: function()
    {
      if (!('Terminal' in window)) {
        eval(this.get('resource_loader').getJs('node_modules/term.js/src/term'));
      }
    },

    __createEmulator: function()
    {
      this.terminal = new Terminal({
        cols: 80,
        rows: 24,
        screenKeys: true
      });
    },

    __createUniqueId: function()
    {
      this.terminalId = 'term' + this.__self.nextFreeId;
      this.__self.nextFreeId++;
    },

    getTerminal: function()
    {
      return this.terminal;
    },

    getTerminalId: function()
    {
      return this.terminalId;
    },

    setPty: function()
    {
      this.pty = pty;
      return this;
    },

    getPty: function()
    {
      return this.pty;
    },

    render: function()
    {
      if (!('pty' in this)) {
        throw new Error('pty must be set before rendering widget');
      }

      this.get('css_loader')
        .load('Consoloid-Tty-base');

      this.__setupPty();
      this.terminal.open(this.node[0]);
    },

    __setupPty: function()
    {
      this.pty.setWebSocketEventToEmitOnData(this.terminalId);

      var asyncRpcClient = this.get('async_rpc_handler_client');
      if (asyncRpcClient.isConnected()) {
        this.__startPty();
      } else {
        asyncRpcClient.getSocket().on('connect', this.__startPty.bind(this));
      }
    },

    __startPty: function()
    {
      this.get('logger').log('debug', 'Starting pty for terminal widget', { terminalId: this.terminalId });
      this.get('async_rpc_handler_client').getSocket()
        .on(this.terminalId, this.receiveDataFromPty.bind(this));
      this.terminal.on('data', this.__sendDataToPty.bind(this));
      this.pty.start();
    },

    receiveDataFromPty: function(data)
    {
      this.terminal.write(data);
    },

    __sendDataToPty: function(data)
    {
      this.get('logger').log('debug', 'Sending data to pty', { data: data });
      this.pty.write(data);
    }
  },
  {
    nextFreeId: 0
  }
);