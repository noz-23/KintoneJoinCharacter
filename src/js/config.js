/*
 *KintoneJoinCharacter
 * Copyright (c) 2024 noz-23
 *  https://github.com/noz-23/
 *
 * Licensed under the MIT License
 * 
 *  利用：
 *   JQuery:
 *     https://jquery.com/
 *     https://js.cybozu.com/jquery/3.7.1/jquery.min.js
 *   
 *   jsrender:
 *     https://www.jsviews.com/
 *     https://js.cybozu.com/jsrender/1.0.13/jsrender.min.js
 * 
 * History
 *  2024/05/26 0.1.0 初版とりあえずバージョン
 *
 */

jQuery.noConflict();

(async (jQuery_, PLUGIN_ID_) => {
  'use strict';

  // 設定パラメータ
  const ParameterCountRow = 'paramCountRow';     // 行数
  const ParameterListRow = 'paramListRow';      // 行のデータ(JSON->テキスト)
  const ParameterMultiField = 'paramMultiField';     // 

  // 環境設定
  const Parameter = {
    // 表示文字
    Lang: {
      en: {
        plugin_titile: 'Join Charactor Plugin',
        plugin_description: 'Join Charactor with linefeed Plugin',
        plugin_label: 'Outputs a concatenated string in a multi-line text field',

        multi_label :'Select Multi Text field',

        front_label: 'Front Text',
        field_label: 'Field',
        back_label: 'Back Text',
        linefeed_label: 'LineFeed',

        status_linefeed: 'LineFeed',

        plugin_cancel: 'Cancel',
        plugin_ok: ' Save ',
      },
      ja: {
        plugin_titile: '文字列結合プラグイン',
        plugin_description: '改行を含んだ文字列結合プラグイン',
        plugin_label: '複数行テキストフィールドに結合した文字列が出力されます',

        multi_label :'複数行テキストフィールドを選択して下さい',

        front_label: '前テキスト',
        field_label: 'フィールド',
        back_label: '後テキスト',
        linefeed_label: '改行',

        status_linefeed: '改行',

        plugin_cancel: 'キャンセル',
        plugin_ok: '   保存  ',
      },
      DefaultSetting: 'ja',
      UseLang: {}
    },
    Html: {
      Form: '#plugin_setting_form',
      Title: '#plugin_titile',
      Description: '#plugin_description',
      Label: '#plugin_label',
      MultiLabel :'#multi_label',

      TableBody: '#table_body',
      AddRow: '.add_row',
      RemoveRow: '.remove_row',

      FieldSelect: '.field_select',

      Cancel: '#plugin_cancel',
      Ok: '#plugin_ok',
    },
    Elements: {
      MultiField: '#multi_select',
      FrontText  : '#front_text',
      FieldSelect: '#field_select',
      BackText   : '#back_text',
      LineFeedSelect: '#linefeed_select',
    },
  };

  /*
  HTMLタグの削除
   引数　：htmlstr タグ(<>)を含んだ文字列
   戻り値：タグを含まない文字列
  */
  const escapeHtml = (htmlstr) => {
    return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;').replace(/'/g, '&#39;');
  };

  /*
  ユーザーの言語設定の読み込み
   引数　：なし
   戻り値：なし
  */
  const settingLang = () => {
    // 言語設定の取得
    Parameter.Lang.UseLang = kintone.getLoginUser().language;
    switch (Parameter.Lang.UseLang) {
      case 'en':
      case 'ja':
        break;
      default:
        Parameter.Lang.UseLang = Parameter.Lang.DefaultSetting;
        break;
    }
    // 言語表示の変更
    var html = jQuery(Parameter.Html.Form).html();
    var tmpl = jQuery.templates(html);

    var useLanguage = Parameter.Lang[Parameter.Lang.UseLang];
    // 置き換え
    jQuery(Parameter.Html.Form).html(tmpl.render({ lang: useLanguage })).show();
  };

  /*
  フィールド設定
   引数　：なし
   戻り値：なし
  */
  const settingHtml = async () => {
    const ListField = await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', { 'app': kintone.app.getId() });

    console.log("ListField:%o", ListField);
    for (const key in ListField.properties) {
      //console.log("properties key:%o",key);
      try {
        const prop = ListField.properties[key];
        //console.log("properties [%o] [%o]",key,prop);

        if (prop.type === 'SINGLE_LINE_TEXT' // 文字列（1行）
          || prop.type === 'MULTI_LINE_TEXT'  // 文字列（複数行）
          || prop.type === 'RICH_TEXT' // リッチエディター
          || prop.type === 'NUMBER' // 数値
          || prop.type === 'CHECK_BOX' // チェックボックス
          || prop.type === 'RADIO_BUTTON' // ラジオボタン
          || prop.type === 'MULTI_SELECT' // 複数選択
          || prop.type === 'DROP_DOWN' // ドロップダウン
          || prop.type === 'DATE' // 日付
          || prop.type === 'TIME' // 時刻
          || prop.type === 'DATETIME' // 日時
          || prop.type === 'LINK' // リンク
        ) {
          const option = jQuery('<option/>');
          option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label));

          jQuery(Parameter.Elements.FieldSelect).append(option);
        }

        if (prop.type === 'MULTI_LINE_TEXT'  // 文字列（複数行）
          || prop.type === 'RICH_TEXT' // リッチエディター
        ) {
          const option = jQuery('<option/>');
          option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label));

          jQuery(Parameter.Elements.MultiField).append(option);
        }
      }
      catch (error) {
        console.log('error:%o', error);
      }
    }

    // 現在データの呼び出し
    var nowConfig = kintone.plugin.app.getConfig(PLUGIN_ID_);
    console.log('nowConfig:%o', nowConfig);

    jQuery(Parameter.Elements.MultiField).val(nowConfig[ParameterMultiField]);

    var count = (nowConfig[ParameterCountRow]) ? Number(nowConfig[ParameterCountRow]) : (0);
    // 作ってから値入れ
    var table = jQuery(Parameter.Html.TableBody);
    for (var i = 1; i < count; i++) {
      var cloneTr = jQuery(Parameter.Html.TableBody + ' > tr').eq(0).clone(true);
      table.append(cloneTr);
    }

    // 現在データの表示
    if (nowConfig[ParameterListRow]) {
      var listRow = JSON.parse(nowConfig[ParameterListRow]);
      var listTr = jQuery(Parameter.Html.TableBody + ' > tr');
      for (var i = 0; i < count; i++) {
        var row = listTr.eq(i);
        jQuery(row).find(Parameter.Elements.FrontText).val(listRow[i].FrontText);
        jQuery(row).find(Parameter.Elements.FieldSelect).val(listRow[i].FieldSelect);
        jQuery(row).find(Parameter.Elements.BackText).val(listRow[i].BackText);
        jQuery(row).find(Parameter.Elements.LineFeedSelect).val(listRow[i].LineFeedSelect);
      }
    }

  };

  /*
  データの保存
   引数　：なし
   戻り値：なし
  */
  const saveSetting = () => {
    // 各パラメータの保存
    var config = {};

    var listTr = jQuery(Parameter.Html.TableBody + ' > tr');

    config[ParameterMultiField] = jQuery(Parameter.Elements.MultiField).val();

    var listRow = [];
    var count = 0;
    for (var row of listTr) {
      var listRowChecked = [];
      console.log("row:%o", row);

      var forntText = jQuery(row).find(Parameter.Elements.FrontText);
      console.log("forntText:%o", forntText);

      var fieldSelect = jQuery(row).find(Parameter.Elements.FieldSelect);
      console.log("fieldSelect:%o", fieldSelect);

      var backText = jQuery(row).find(Parameter.Elements.BackText);
      console.log("backText:%o", backText);

      var lineFeedSelect = jQuery(row).find(Parameter.Elements.LineFeedSelect);
      console.log("lineFeedSelect:%o", lineFeedSelect);
      //
      listRow.push({
        FrontText: forntText.val(), FieldSelect: fieldSelect.val(),
        BackText: backText.val(), LineFeedSelect: lineFeedSelect.val(),
      });
      count++;
    }
    config[ParameterCountRow] = '' + count;

    // 配列は一旦文字列化して保存
    config[ParameterListRow] = JSON.stringify(listRow);

    console.log('config:%o', config);

    // 設定の保存
    kintone.plugin.app.setConfig(config);
  };


  /*
  行の追加
   引数　：なし
   戻り値：なし
  */
  function AddRow() {
    // ラムダ式のthisは全体になりボタンでなくなるためfunctionを利用
    console.log("AddRow this:%o", this);
    var add = jQuery(Parameter.Html.TableBody + ' > tr').eq(0).clone(true).insertAfter(jQuery(this).parent().parent());
  };

  /*
  行の削除
   引数　：なし
   戻り値：なし
  */
  function RemoveRow() {
    console.log("RemoveRow this:%o", this);
    jQuery(this).parent("td").parent("tr").remove();
  };

  // 言語設定
  settingLang();
  await settingHtml();

  // 保存
  jQuery(Parameter.Html.Ok).click(() => { saveSetting(); });
  // キャンセル
  jQuery(Parameter.Html.Cancel).click(() => { history.back(); });

  //行追加
  jQuery(Parameter.Html.AddRow).click(AddRow);
  jQuery(Parameter.Html.RemoveRow).click(RemoveRow);

})(jQuery, kintone.$PLUGIN_ID);
