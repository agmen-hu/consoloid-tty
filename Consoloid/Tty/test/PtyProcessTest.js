require('consoloid-framework/Consoloid/Test/UnitTest');
require('consoloid-os/Consoloid/OS/Process');
require('../PtyProcess');

describeUnitTest('Consoloid.Tty.PtyProcess', function() {
  var
    ptyProcess,
    childProcess;

  beforeEach(function() {
    ptyProcess = env.create('Consoloid.Tty.PtyProcess', {
        command: 'ls',
        args: ['-l']
    });

    ptyProcess.setCommand('/bin/ls');
    ptyProcess.setArgs(['-l']);

    childProcess = {
      on: sinon.spy(),
    };

    ptyProcess.spawn = function(command, args, spawnOptions) {
      return childProcess;
    };
});

  describe('#__bindEventCallbacks()', function() {
    it('should bind to data, exit and error events on childProcess', function() {
      sinon.spy(ptyProcess, '__bindEventCallbacks');

      ptyProcess.start();

      ptyProcess.__bindEventCallbacks.calledOnce.should.be.true;
      childProcess.on.calledThrice.should.be.true;
      childProcess.on.args[0][0].should.eql('data');
      childProcess.on.args[1][0].should.eql('exit');
      childProcess.on.args[2][0].should.eql('error');
    });
  });

  describe('#__receivePtyData(data)', function() {
    var
      emitSpy;

    beforeEach(function() {
      emitSpy = sinon.spy();
      env.addServiceMock('async_rpc_handler_server', {
        getSocket: function() {
          return {
            emit: emitSpy
          }
        }
      });
    });

    it('should emit received data on socket.io when event name is configured', function() {
      ptyProcess.setWebSocketEventToEmitOnData('testEvent');
      ptyProcess.__receivePtyData('testData');

      emitSpy.calledOnce.should.be.true;
      emitSpy.args[0][0].should.eql('testEvent');
      emitSpy.args[0][1].should.eql('testData');
    });

    it('should do nothing when event name is not configured', function() {
      ptyProcess.__receivePtyData('testData');

      emitSpy.calledOnce.should.be.false;
    });
  });

  describe('#__handleChildProcessExit(code)', function() {
    it('should wait for child process to finish using waitpid', function() {
      childProcess.end = sinon.spy();
      childProcess.pid = 'testPidNr';
      ptyProcess._waitpid = sinon.spy();

      ptyProcess.start();
      ptyProcess.isRunning.should.be.true;

      ptyProcess.__handleChildProcessExit(10);

      childProcess.end.calledOnce.should.be.true;
      ptyProcess.isRunning.should.be.false;
      ptyProcess._waitpid.calledOnce.should.be.true;
      ptyProcess._waitpid.args[0][0].should.eql('testPidNr');
    });
  });

  describe('#__handleChildProcessError(error)', function() {
    it('should clear running state on ENOENT error', function() {
      ptyProcess.start();
      ptyProcess.isRunning.should.be.true;

      ptyProcess.__handleChildProcessError({ message: 'spawn ENOENT' });
      ptyProcess.isRunning.should.be.false;
    });
  });
});
