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

(async (PLUGIN_ID_) => {
  'use strict';

  // 設定パラメータ
  // 設定パラメータ
  const ParameterCountRow = 'paramCountRow';     // 行数
  const ParameterListRow = 'paramListRow';      // 行のデータ(JSON->テキスト)
  const ParameterMultiField = 'paramMultiField';     // 


  const EVENTS_EDIT = [
    'app.record.create.show', // 作成表示
    'app.record.edit.show',   // 編集表示
    //'app.record.index.show',  // 一覧表示
    'app.record.create.edit', // 作成表示
    'app.record.edit.edit',   // 編集表示
    'app.record.index.edit',  // 一覧表示
    //'app.record.create.submit', // 作成表示
    //'app.record.edit.submit',   // 編集表示
    //'app.record.index.submit',  // 一覧表示
    //'app.record.detail.show', // 作成表示
  ];
  kintone.events.on(EVENTS_EDIT, async (events_) => {
    console.log('events_:%o', events_);

    // Kintone プラグイン 設定パラメータ
    const config = kintone.plugin.app.getConfig(PLUGIN_ID_);
    var multiField =config[ParameterMultiField];

    events_.record[multiField].disabled =true;
    return events_;

  });

  const EVENTS_SUBMIT = [
    //'app.record.create.show', // 作成表示
    //'app.record.edit.show',   // 編集表示
    //'app.record.index.show',  // 一覧表示
    //'app.record.create.edit', // 作成表示
    //'app.record.edit.edit',   // 編集表示
    //'app.record.index.edit',  // 一覧表示
    'app.record.create.submit', // 作成表示
    'app.record.edit.submit',   // 編集表示
    'app.record.index.submit',  // 一覧表示
    //'app.record.detail.show', // 作成表示
  ];

  kintone.events.on(EVENTS_SUBMIT, async (events_) => {
    console.log('events_:%o', events_);

    // Kintone プラグイン 設定パラメータ
    const config = kintone.plugin.app.getConfig(PLUGIN_ID_);
    var multiField =config[ParameterMultiField];

    // テキストからJSONへ変換
    var listCount = Number(config[ParameterCountRow]);
    if (listCount == 0) {
      return events_;
    }

    // 設定列の変換
    var listRow = JSON.parse(config[ParameterListRow]);
    console.log('listRow:%o', listRow);

    // 文字列の結合
    var str='';
    for (var row of listRow) {
      str +=row.FrontText;
      str +=events_.record[row.FieldSelect].value;
      str +=row.BackText;
      str +=(row.LineFeedSelect=='linefeed') ?('\n'):('');
    }
    events_.record[multiField].value =str;
    console.log('str:%o', str);
    return events_;
  });

})(kintone.$PLUGIN_ID);
