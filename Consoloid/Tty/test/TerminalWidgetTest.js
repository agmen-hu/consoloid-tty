require('consoloid-framework/Consoloid/Test/UnitTest');
require('consoloid-framework/Consoloid/Widget/Widget');
require('consoloid-framework/Consoloid/Widget/JQoteTemplate');
require('../TerminalWidget');

describeUnitTest('Consoloid.Tty.TerminalWidget', function() {
  describe('#__constructor()', function() {
    it('should require pty to be injected', function() {
      (function() {
        env.create('Consoloid.Tty.TerminalWidget', {});
      }).should.throwError('pty must be injected');
    });

    it('should load term.js when not loaded', function() {
      sinon.stub(env.get('resource_loader'), 'getJs', function() {
        window.Terminal = global.Terminal = function() {};
      });

      env.create('Consoloid.Tty.TerminalWidget', {
        pty: 'test'
      });

      env.get('resource_loader').getJs.calledOnce.should.be.true;

      env.create('Consoloid.Tty.TerminalWidget', {
        pty: 'test'
      });

      env.get('resource_loader').getJs.calledOnce.should.be.true;

      delete window.Terminal;
      delete global.Terminal;
    });

    it('should create a unique terminal id for each instance', function() {
      window.Terminal = global.Terminal = function() {};

      var terminal1 = env.create('Consoloid.Tty.TerminalWidget', {
        pty: 'test'
      });

      var terminal2 = env.create('Consoloid.Tty.TerminalWidget', {
        pty: 'test'
      });

      terminal1.getTerminalId().should.not.equal(terminal2.getTerminalId());

      delete window.Terminal;
      delete global.Terminal;
    });
  });

  describe('#render()', function() {
    var
      pty,
      socket,
      terminal;

    beforeEach(function() {
      window.Terminal = global.Terminal = function() {};

      pty = {
        setWebSocketEventToEmitOnData: sinon.spy(),
        start: sinon.spy()
      };

      socket = {
        on: sinon.spy()
      };

      terminal = env.create('Consoloid.Tty.TerminalWidget', {
        pty: pty
      });

      terminal.getTerminal().open = sinon.spy();
      terminal.getTerminal().on = sinon.spy();

      env.addServiceMock('css_loader', { load: sinon.spy() });
      env.addServiceMock('async_rpc_handler_client', {
        isConnected: sinon.stub().returns(true),
        getSocket: sinon.stub().returns(socket)
      });
    });

    afterEach(function() {
      delete window.Terminal;
      delete global.Terminal;
    });

    it('should tell to the pty what signal to emit on data output', function() {
      terminal.render();

      pty.setWebSocketEventToEmitOnData.calledOnce.should.be.true;
      pty.setWebSocketEventToEmitOnData.args[0][0].should.equal(terminal.getTerminalId());
    });

    it('should start the pty when async rpc client is connected', function() {
      terminal.render();

      pty.start.calledOnce.should.be.true;
    });

    it('should register a callback to start the pty later when async rpc client is not connected', function() {
      env.get('async_rpc_handler_client')
        .isConnected = sinon.stub().returns(false);

      terminal.render();

      socket.on.calledOnce.should.be.true;
      socket.on.args[0][0].should.equal('connect');
    });

    it('should open the terminal', function() {
      terminal.render();

      terminal.getTerminal().open.calledOnce.should.be.true;
    });
  });

  describe('#receiveDataFromPty(data)', function() {
    it('should write data to terminal', function() {
      window.Terminal = global.Terminal = function() {};

      var terminal = env.create('Consoloid.Tty.TerminalWidget', {
        pty: 'test'
      });

      terminal.getTerminal().write = sinon.spy();

      terminal.receiveDataFromPty('test');

      terminal.getTerminal().write.calledOnce.should.be.true;
      terminal.getTerminal().write.args[0][0].should.equal('test');

      delete window.Terminal;
      delete global.Terminal;
    });
  });
});