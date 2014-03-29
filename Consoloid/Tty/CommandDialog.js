defineClass('Consoloid.Tty.CommandDialog', 'Consoloid.Ui.Dialog',
  {
    __constructor: function(options)
    {
      this.__base($.extend({
        responseTemplateId: 'Consoloid-Tty-CommandDialog'
      }, options));

      this.requireProperty('pty');

      if (!('terminal' in this)) {
        this.terminal = this.create('Consoloid.Tty.TerminalWidget', {
          container: this.container,
          pty: this.pty
        });
      }
    },

    setup: function()
    {
      this.expression.text = this.arguments.text;
      this.args = this.arguments.text.split(' ');
      this.command = this.args.shift();

      this.pty.setCommand(this.command);
      this.pty.setArgs(this.args);
    },

    render: function()
    {
      this.get('css_loader')
        .load('Consoloid-Tty-base');

      this.__base();
      this.terminal
        .setNode(this.node.find(".response .terminal"))
        .render();
    }
  }
);
