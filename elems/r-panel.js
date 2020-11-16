/*
**	rin-front/elems/r-panel
**
**	Copyright (c) 2019-2020, RedStar Technologies, All rights reserved.
**	https://www.rsthn.com/
**
**	THIS LIBRARY IS PROVIDED BY REDSTAR TECHNOLOGIES "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
**	INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A 
**	PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL REDSTAR TECHNOLOGIES BE LIABLE FOR ANY
**	DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT 
**	NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; 
**	OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, 
**	STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
**	USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
	<r-panel data-route="name">
	</r-panel>

	.panel:not(.active) {
		display: none !important;
	}

*/

let Element = require('../element');
let Router = require('../router');

Element.register ('r-panel',
{
	/**
	**	Element events.
	*/
	events:
	{
	},

	/**
	**	Initializes the element.
	*/
	init: function()
	{
		this.classList.add('panel');

		// Executed then the panel route is activated.
		this._onActivate = (evt, args) =>
		{
			if (!args.route.changed)
				return;

			this.show(true);
		};

		// Executed then the panel route is deactivated.
		this._onDeactivate = (evt, args) =>
		{
			this.hide();
		};

		this.hide();
	},

	/**
	**	Executed when the children of the element are ready.
	*/
	ready: function()
	{
	},

	/**
	**	Adds a handler to Router if the data-route attribute was set.
	*/
	onConnected: function()
	{
		if (this.dataset.route)
			Router.addRoute (this.dataset.route, this._onActivate, this._onDeactivate);
	},

	/**
	**	Removes a handler previously added to Router if the data-route attribute was set.
	*/
	onDisconnected: function()
	{
		if (this.dataset.route)
			Router.removeRoute(this.dataset.route, this._onActivate, this._onDeactivate);
	},

	/**
	**	Hides the panel.
	*/
	hide: function ()
	{
		this.classList.remove('active');
		this.dispatch('panelHidden', { });
	},

	/**
	**	Makes the panel visible.
	*/
	show: function (noHashChange=false)
	{
		if (this.dataset.route && !noHashChange)
		{
			let hash = "#" + this.dataset.route;

			if (window.location.hash.substr(0, hash.length) != hash)
			{
				window.location = hash;
				return;
			}
		}

		this.classList.add('active');
		this.dispatch('panelShown', { });
	}
});
