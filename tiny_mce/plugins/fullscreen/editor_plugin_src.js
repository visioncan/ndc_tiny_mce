/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	var DOM = tinymce.DOM;

	tinymce.create('tinymce.plugins.FullScreenPlugin', {
		init : function(ed, url) {
			var t = this, s = {}, vp, posCss;

			t.editor = ed;

			// Register commands
			ed.addCommand('mceFullScreen', function() {
				var win, de = DOM.doc.documentElement;

				if (ed.getParam('fullscreen_is_enabled')) {
					if (ed.getParam('fullscreen_new_window'))
						closeFullscreen(); // Call to close in new window
					else {
						DOM.win.setTimeout(function() {
							tinymce.dom.Event.remove(DOM.win, 'resize', t.resizeFunc);
							tinyMCE.get(ed.getParam('fullscreen_editor_id')).setContent(ed.getContent());
							tinyMCE.remove(ed);
							DOM.remove('mce_fullscreen_container');
							de.style.overflow = ed.getParam('fullscreen_html_overflow');
							DOM.setStyle(DOM.doc.body, 'overflow', ed.getParam('fullscreen_overflow'));
							DOM.win.scrollTo(ed.getParam('fullscreen_scrollx'), ed.getParam('fullscreen_scrolly'));
							tinyMCE.settings = tinyMCE.oldSettings; // Restore old settings

							//show e7edit panel
							if (DOM.doc.getElementById("e7edit-panel") !== null) {
								DOM.show(DOM.doc.getElementById("e7edit-panel"));
								DOM.show(DOM.doc.getElementById("wrap"));
							};
						}, 10);
					}

					return;
				}

				if (ed.getParam('fullscreen_new_window')) {
					win = DOM.win.open(url + "/fullscreen.htm", "mceFullScreenPopup", "fullscreen=yes,menubar=no,toolbar=no,scrollbars=no,resizable=yes,left=0,top=0,width=" + screen.availWidth + ",height=" + screen.availHeight);
					try {
						win.resizeTo(screen.availWidth, screen.availHeight);
					} catch (e) {
						// Ignore
					}
				} else {
					tinyMCE.oldSettings = tinyMCE.settings; // Store old settings
					s.fullscreen_overflow = DOM.getStyle(DOM.doc.body, 'overflow', 1) || 'auto';
					s.fullscreen_html_overflow = DOM.getStyle(de, 'overflow', 1);
					vp = DOM.getViewPort();
					s.fullscreen_scrollx = vp.x;
					s.fullscreen_scrolly = vp.y;
					//取得編輯區寬
					s.orgEditorWidth = t.editor.contentDocument.body.offsetWidth;

					// Fixes an Opera bug where the scrollbars doesn't reappear
					if (tinymce.isOpera && s.fullscreen_overflow == 'visible')
						s.fullscreen_overflow = 'auto';

					// Fixes an IE bug where horizontal scrollbars would appear
					if (tinymce.isIE && s.fullscreen_overflow == 'scroll')
						s.fullscreen_overflow = 'auto';

					// Fixes an IE bug where the scrollbars doesn't reappear
					if (tinymce.isIE && (s.fullscreen_html_overflow == 'visible' || s.fullscreen_html_overflow == 'scroll'))
						s.fullscreen_html_overflow = 'auto';

					if (s.fullscreen_overflow == '0px')
						s.fullscreen_overflow = '';

					DOM.setStyle(DOM.doc.body, 'overflow', 'hidden');


					//hide e7edit panel
					if (DOM.doc.getElementById("e7edit-panel") !== null) {
						var NDC_e7edit = DOM.doc.getElementById("e7edit-panel");
						var NDC_wrap = DOM.doc.getElementById("wrap");
						DOM.setStyle(NDC_e7edit, 'display', 'none');
						DOM.setStyle(NDC_wrap, 'display', 'none');
					};

					de.style.overflow = 'hidden'; //Fix for IE6/7
					vp = DOM.getViewPort();
					DOM.win.scrollTo(0, 0);

					if (tinymce.isIE)
						vp.h -= 1;

					// Use fixed position if it exists
					if (tinymce.isIE6 || document.compatMode == 'BackCompat')
						posCss = 'absolute;top:' + vp.y;
					else
						posCss = 'fixed;top:0';

					n = DOM.add(DOM.doc.body, 'div', {
						id : 'mce_fullscreen_container',
						style : 'position:' + posCss + ';left:0;width:' + vp.w + 'px;height:' + vp.h + 'px;z-index:200000; background-color:#FFF;'});
					DOM.add(n, 'div', {id : 'mce_fullscreen'});

					tinymce.each(ed.settings, function(v, n) {
						s[n] = v;
					});

					s.id = 'mce_fullscreen';
					s.width = n.clientWidth;
					s.height = n.clientHeight - 15;
					s.fullscreen_is_enabled = true;
					s.fullscreen_editor_id = ed.id;
					s.theme_advanced_resizing = false;
					s.save_onsavecallback = function() {
						ed.setContent(tinyMCE.get(s.id).getContent());
						ed.execCommand('mceSave');
					};

					tinymce.each(ed.getParam('fullscreen_settings'), function(v, k) {
						s[k] = v;
					});

					if (s.theme_advanced_toolbar_location === 'external')
						s.theme_advanced_toolbar_location = 'top';

					//console.log(s);
					//toolbar change!!!
					s.body_class = "main-content fullscreen";
					s.theme_advanced_buttons1 = "save,|,undo,redo,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,forecolor,backcolor,formatselect,fontselect,fontsizeselect,styleselect";
					s.theme_advanced_buttons2 = "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,|,link,unlink,anchor,image,media,|,table,|,row_props,row_after,delete_row,|,col_after,delete_col,|,split_cells,merge_cells,|,removeformat,cleanup,visualaid,|,fullscreen,code,preview";
					s.theme_advanced_buttons3 = "";
					s.theme_advanced_buttons4 = "";

					//

					t.fullscreenEditor = new tinymce.Editor('mce_fullscreen', s);
					t.fullscreenEditor.onInit.add(function() {
						t.fullscreenEditor.setContent(ed.getContent());
						t.fullscreenEditor.focus();
					});

					t.fullscreenEditor.render();

					t.fullscreenElement = new tinymce.dom.Element('mce_fullscreen_container');
					t.fullscreenElement.update();
					
					//指定寬
					DOM.setStyle(t.fullscreenEditor.contentDocument.body, 'width', s.orgEditorWidth);
					
					t.container = new tinymce.dom.Element(t.fullscreenEditor.editorContainer);
					t.container.add('span', {
						id:"close_fullscreen_btn", 
						title : "Exit full screen",
						onClick : "tinyMCE.get('mce_fullscreen').execCommand('mceFullScreen');return false;"
					}, "&nbsp;");
					t.container.setStyle('opacity','0');
					DOM.win.setTimeout(function(){
						t.container.setStyles({
							'opacity' : '1',
							'-moz-transition' : 'opacity 1s',
							'-webkit-transition' : 'opacity 1s',
							'transition' : 'opacity 1s'
						});
					}, 150);

					t.resizeFunc = tinymce.dom.Event.add(DOM.win, 'resize', function() {
						var vp = tinymce.DOM.getViewPort(), fed = t.fullscreenEditor, outerSize, innerSize;

						// Get outer/inner size to get a delta size that can be used to calc the new iframe size
						outerSize = fed.dom.getSize(fed.getContainer().getElementsByTagName('table')[0]);
						innerSize = fed.dom.getSize(fed.getContainer().getElementsByTagName('iframe')[0]);

						fed.theme.resizeTo(vp.w - outerSize.w + innerSize.w, vp.h - outerSize.h + innerSize.h);
					});
				}
			});

			// Register buttons
			ed.addButton('fullscreen', {title : 'fullscreen.desc', cmd : 'mceFullScreen'});

			ed.onNodeChange.add(function(ed, cm) {
				cm.setActive('fullscreen', ed.getParam('fullscreen_is_enabled'));
			});
		},

		getInfo : function() {
			return {
				longname : 'Fullscreen',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/fullscreen',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('fullscreen', tinymce.plugins.FullScreenPlugin);
})();
