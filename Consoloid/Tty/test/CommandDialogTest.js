require('consoloid-framework/Consoloid/Test/UnitTest');
require('consoloid-framework/Consoloid/Widget/JQoteTemplate');
require('consoloid-framework/Consoloid/Widget/jquery.jqote2.min.js');
require('consoloid-framework/Consoloid/Widget/Widget');
require('consoloid-console/Consoloid/Ui/Dialog');
require('../TerminalWidget');
require('../CommandDialog');

describeUnitTest('Consoloid.Tty.CommandDialog', function() {
  describe('#__constructor()', function() {
    it('should require pty to be injected', function() {
      (function() {
        env.create('Consoloid.Tty.CommandDialog', {});
      }).should.throwError('pty must be injected');
    });

    it('should create a terminal widget when not injected', function() {
      window.Terminal = global.Terminal = function() {};

      var dialog = env.create('Consoloid.Tty.CommandDialog', { pty: 'test' });
      dialog.should.have.property('terminal');

      delete window.Terminal;
      delete global.Terminal;
    });

    it('should not create terminal widget when injected', function() {
      var dialog = env.create('Consoloid.Tty.CommandDialog', {
        pty: 'test',
        terminal: 'testTerminal'
      });

      dialog.should.have.property('terminal');
      dialog.terminal.should.equal('testTerminal');
    });
  });

  describe('#setup()', function() {
    it('should set command and arguments in pty', function() {
      var pty = {
        setCommand: sinon.spy(),
        setArgs: sinon.spy()
      };

      var dialog = env.create('Consoloid.Tty.CommandDialog', {
        pty: pty,
        terminal: 'testTerminal'
      });

      dialog.arguments = { text: 'ls -la /tmp' };
      dialog.expression = {};
      dialog.setup();

      pty.setCommand.calledOnce.should.be.true;
      pty.setCommand.args[0][0].should.equal('ls');
      pty.setArgs.calledOnce.should.be.true;
      pty.setArgs.args[0][0].should.eql([ '-la', '/tmp' ]);
    });
  });

  describe('#render()', function() {
    it('should render the terminal widget', function() {
      var terminal = {
        render: sinon.spy()
      };

      terminal.setNode = sinon.stub().returns(terminal);

      var dialog = env.create('Consoloid.Tty.CommandDialog', {
        pty: 'test',
        terminal: terminal
      });

      env.addServiceMock('console', {
        animateMarginTopIfNecessary: sinon.spy(),
        getVisibleDialogsHeight: sinon.spy()
      });

      env.get('resource_loader').getTemplate = sinon.stub().returns(
        '<script id="Consoloid-Ui-Dialog" type="text/x-jqote-template"><![CDATA[x]]></script>' +
        '<script id="Consoloid-Tty-CommandDialog" type="text/x-jqote-template"><![CDATA[x]]></script>'
      );

      dialog.render();

      terminal.render.calledOnce.should.be.true;
    });
  });
});
