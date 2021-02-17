/*
**	rin-front/elems/r-tabs
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
	<r-tabs [data-container="div.tab-container"] [data-base-route="@"]>
		<a data-name="home">Home</a>
		<a data-name="users">Users</a>
		<a data-name="products">Products</a>
		<a data-name="account">Account</a>
	</r-tabs>

	<div class="tab-container">
		<div data-name="home">
			Home
		</div>

		<div data-name="users">
			Users
		</div>
	</div>

	.tab-container > div.hidden {
		display: none;
	}
*/

let Element = require('../element');
let Router = require('../router');

Element.register ('r-tabs',
{
	/**
	**	Element events.
	*/
	events:
	{
		'click [data-name]': function (evt)
		{
			evt.continuePropagation = true;

			if (this.dataset.baseRoute)
			{
				window.location = "#" + this.dataset.baseRoute.replace('@', evt.source.dataset.name);
				return;
			}

			this.selectTab (evt.source.dataset.name);
		}
	},

	/**
	**	Initializes the Tabs element.
	*/
	init: function()
	{
		this.classList.add('tabs');

		this._routeHandler = (evt, args) =>
		{
			if (!args.route.changed)
				return;

			this._showTab (args.tabName);
		};
	},

	/**
	**	Executed when the children of the element are ready.
	*/
	ready: function()
	{
		if ("container" in this.dataset)
			this.container = document.querySelector(this.dataset.container);
		else
			this.container = this.nextElementSibling;

		this._hideTabsExcept(null);
	},

	/**
	**	Adds a handler to Router if the data-base-route attribute was set.
	*/
	onConnected: function()
	{
		if (this.dataset.baseRoute)
			Router.addRoute (this.dataset.baseRoute.replace('@', ':tabName'), this._routeHandler);
	},

	/**
	**	Removes a handler previously added to Router if the data-base-route attribute was set.
	*/
	onDisconnected: function()
	{
		if (this.dataset.baseRoute)
			Router.removeRoute(this.dataset.baseRoute.replace('@', ':tabName'), this._routeHandler);
	},

	/**
	**	Hides all tabs except the one with the specified exceptName, if none specified then all tabs will be hidden (adds .hidden CSS class),
	**	additionally the respective link item in the tab definition will have class 'active'.
	*/
	_hideTabsExcept: function (exceptName)
	{
		if (this.container == null) return;

		if (!exceptName) exceptName = '';

		for (let i = 0; i < this.container.children.length; i++)
		{
			if (this.container.children[i].dataset.name == exceptName)
			{
				if (this.container.children[i].classList.contains('hidden'))
					this.dispatch('tab-activate', { name: this.container.children[i].dataset.name, el: this.container.children[i] });

				this.container.children[i].classList.remove('hidden');
			}
			else
			{
				if (!this.container.children[i].classList.contains('hidden'))
					this.dispatch('tab-deactivate', { name: this.container.children[i].dataset.name, el: this.container.children[i] });

				this.container.children[i].classList.add('hidden');
			}
		}

		let links = this.querySelectorAll("[data-name]");

		for (let i = 0; i < links.length; i++)
		{
			if (links[i].dataset.name == exceptName)
				links[i].classList.add('active');
			else
				links[i].classList.remove('active');
		}
	},

	/**
	**	Shows the tab with the specified name.
	*/
	_showTab: function (name)
	{
		return this._hideTabsExcept (name);
	},

	/**
	**	Selects a tab given its name.
	*/
	selectTab: function (name)
	{
		if (this.dataset.baseRoute)
		{
			const hash = "#" + this.dataset.baseRoute.replace('@', name);

			if (window.location.hash != hash)
			{
				window.location = hash;
				return;
			}
		}

		this._showTab (name);
	}
});
