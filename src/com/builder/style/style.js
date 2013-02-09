var Style=
{
	style:null,
	className:
	{
		header:"blackheader",
		nav:"blacknav",
		blacktheme:"blacktheme",
		navButton:"navbutton",
		button:"blackbutton",
		carouselLeftButton:"carouselleftbutton",
		carouselRightButton:"carouselrightbutton",
		formInputTitle:"forminputtitle",
		formInputHolder:"forminputholder",
		formTextArea:"formtextarea",
		formInput:"forminput",
		clearBoth:"clearboth"
	},
	defaultStyle:".pageScroller{background-color: #333;}.floatLeft{float:left;}.social-holder{overflow:hidden;height:25px;}",
	pageHolder:function(holder)
	{
		holder.style.height=Utensil.stageHeight();
		holder.style.width=Utensil.stageWidth();
		
	},
	addDefault:function()
	{
		Spider.data.className.scroller = "pageScroller";
		this.style = document.createElement("style")
		this.style.setAttribute("rel", "stylesheet")
		this.style.setAttribute("type", "text/css")
		this.style.setAttribute("id", "defaultStyle")

		document.getElementsByTagName("head")[0].appendChild(this.style);
		if (localStorage)
			localStorage.setItem('styleData', this.defaultStyle);
		if (this.style.styleSheet) {// IE

			this.style.styleSheet.cssText = this.defaultStyle;

		} else {
			this.style.appendChild(document.createTextNode(this.defaultStyle));
		}
	}
}
