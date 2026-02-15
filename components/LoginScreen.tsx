
import React, { useState, useEffect } from 'react';
import { AppSession, AppUser } from '../types';

interface LoginScreenProps {
  onLogin: (session: AppSession, scriptUrl: string) => void;
  initialScriptUrl?: string;
  themeColor?: string;
}

const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3y-1.5L15.5 7.5z"/></svg>;
const CloudOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 2 20 20"/><path d="M6.39 6.39a5 5 0 0 0 7.07 7.07"/><path d="M11.77 6.17a5 5 0 0 1 7.27 4.2"/><path d="M21 16h-4.5"/><path d="M4.5 16H3a5 5 0 0 1 0-10h1.5"/></svg>;

const DEPLOYMENT_SCRIPT = `// Unified Cloud Engine v202.11 (Scroll Lock Fix)
const HISTORY_SHEET_NAME = "history";
const CONFIG_SHEET_NAME = "_TabConfigs_";
const USERS_SHEET_NAME = "USERS";
const METRICS_SHEET_NAME = "_REPORT_SUMMARY_";
const INVESTORS_SHEET_NAME = "Investors";
const SIGNATURES_SHEET_NAME = "Signatures";
const CONTRACTS_SHEET_NAME = "_Contracts_";
const SKIP_ROWS = 3; 

function isSystemSheet(sheetName) {
  var name = sheetName.toLowerCase().trim();
  return name.startsWith("_") || name.startsWith("report_") || name === HISTORY_SHEET_NAME.toLowerCase() || name === "earnings" || name === USERS_SHEET_NAME.toLowerCase() || name === INVESTORS_SHEET_NAME.toLowerCase() || name === SIGNATURES_SHEET_NAME.toLowerCase() || name === CONTRACTS_SHEET_NAME.toLowerCase() || name === "main ledger" || name.endsWith(" incoming") || name.endsWith(" outgoing");
}

function getTabConfigs(ss) {
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG_SHEET_NAME);
    ensureHeaders(sheet, 'config');
  }
  var data = sheet.getDataRange().getValues();
  var configs = { types: {}, currencyConfigs: {}, appPin: "", authorizedSignature: "" };
  for (var i = 1; i < data.length; i++) {
    var key = data[i][0];
    if (!key) continue;
    var val = data[i][1];
    if (key === "appPin") configs.appPin = val.toString();
    else if (key === "authorizedSignature") configs.authorizedSignature = val.toString();
    else if (key.indexOf("type_") === 0) configs.types[key.replace("type_", "")] = val;
    else if (key.indexOf("currency_") === 0) {
      try { configs.currencyConfigs[key.replace("currency_", "")] = JSON.parse(val); } catch(e) {}
    }
  }
  return configs;
}

function ensureHeaders(sheet, type) {
    if (!sheet) return;
    var lastRow = sheet.getLastRow();
    if (lastRow >= SKIP_ROWS) return; 
    
    var headers = [];
    var color = "#1e293b"; 
    
    if (type === 'users') { headers = ["ID", "Username", "Password", "Restrictions"]; }
    else if (type === 'salary') { headers = ["ID", "Start Date", "End Date", "Amount", "Remarks"]; }
    else if (type === 'business') { headers = ["ID", "Type", "Name", "Amount", "Date", "Remarks"]; }
    else if (type === 'savings') { headers = ["ID", "Type", "Name", "Amount", "Date", "Status", "Remarks", "Actual"]; }
    else if (type === 'supply' || type === 'product') { headers = ["ID", "Type", "Name", "Code", "Qty", "Price", "Date", "Remarks", "Min", "Max"]; }
    else if (type === 'supply_trans') { headers = ["LOG ID", "TRANS TYPE", "PRODUCT", "QTY", "DATE", "REMARKS"]; }
    else if (type === 'config') { headers = ["Key", "Value"]; }
    else if (type === 'metrics') { headers = ["Category", "Metric Label", "Value", "Currency/Unit", "Update Date"]; color = "#0f172a"; }
    else if (type === 'cashflow') { headers = ["ID", "Amount", "Date", "Remarks", "Reference", "Type", "Tab"]; }
    else if (type === 'investors') { headers = ["ID", "Name", "Bank Name", "Bank Number", "Amount", "Date Invested", "Percent", "Monthly Amount"]; }
    else if (type === 'signatures') { headers = ["ID", "Signer Name", "Address", "Date Signed", "Signature (Base64)", "Status", "Term", "Period", "Amount Per Due", "Amount", "Start Date", "End Date", "Type"]; }
    else if (type === 'contracts') { headers = ["Draft ID", "Data (JSON)", "Created At", "Status"]; }
    else { headers = ["ID", "Name", "Amount", "Date", "Remarks", "Facebook", "Contact", "EndDate", "Status", "Type", "Tab"]; }
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground(color).setFontColor("white");
    
    if (type === 'cashflow') {
      sheet.getRange("A2").setValue(0).setBackground("#f1f5f9").setFontWeight("bold");
      sheet.getRange("B2").setValue("Initial Balance (Enter Left)").setFontStyle("italic").setFontColor("#64748b");
    } else {
      var metaRow = headers.map(function() { return "SYSTEM_METADATA_RESERVED"; });
      sheet.getRange(2, 1, 1, headers.length).setBackground("#fafafa").setFontColor("#cbd5e1").setFontSize(7).setValues([metaRow]);
    }
    
    var reservedRow = headers.map(function() { return "---"; });
    sheet.getRange(3, 1, 1, headers.length).setBackground("#f8fafc").setValues([reservedRow]).setFontColor("#e2e8f0").setFontSize(8);
}

function safeAppend(sheet, rowData) {
  var lastRow = sheet.getLastRow();
  var targetRow = Math.max(SKIP_ROWS + 1, lastRow + 1);
  sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
}

function getRecords(sheet, type) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= SKIP_ROWS) return [];
  var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  var formatDateSafe = function(val) {
    if (!val) return "";
    var d = new Date(val);
    if (!isNaN(d.getTime())) return Utilities.formatDate(d, tz, "yyyy-MM-dd");
    return val.toString().split('T')[0];
  };
  return data.slice(SKIP_ROWS).map(function(row) {
    if (!row[0] || row[0].toString().trim() === "" || row[0] === "---") return null;
    var record = { id: row[0].toString() };
    if (type === 'signatures') { 
        record.id = row[0].toString(); 
        record.signerName = row[1] ? row[1].toString() : "";
        record.signerAddress = row[2] ? row[2].toString() : "";
        record.signatureDate = formatDateSafe(row[3]); 
        record.signature = row[4] ? row[4].toString() : ""; 
        return record; 
    }
    if (type === 'users') {
      record.username = row[1] ? row[1].toString() : "";
      record.password = row[2] ? record[2].toString() : "";
      try { record.restrictions = row[3] ? JSON.parse(row[3].toString()) : []; } catch(e) { record.restrictions = []; }
      return record;
    }
    if (type === 'salary') { record.date = formatDateSafe(row[1]); record.endDate = formatDateSafe(row[2]); record.amount = Number(row[3]) || 0; record.remarks = row[4] ? row[4].toString() : ""; record.name = "Salary Payment"; }
    else if (type === 'business') { record.businessEntryType = row[1] ? row[1].toString().toLowerCase().trim() : "expense"; record.name = row[2] ? row[2].toString().trim() : ""; record.amount = Number(row[3]) || 0; record.date = formatDateSafe(row[4]); record.remarks = row[5] ? row[5].toString() : ""; }
    else if (type === 'savings') { record.transactionType = row[1] ? row[1].toString().toLowerCase().trim() : "income"; record.name = row[2] ? row[2].toString().trim() : ""; record.amount = Number(row[3]) || 0; record.date = formatDateSafe(row[4]); record.status = row[5] ? row[5].toString() : "active"; record.remarks = row[6] ? row[6].toString() : ""; record.actualAmount = row[7] ? Number(row[7]) : undefined; }
    else if (type === 'supply' || type === 'product') { record.transactionType = row[1] ? row[1].toString().toLowerCase().trim() : "income"; record.name = row[2] ? row[2].toString().trim() : ""; record.itemCode = row[3] ? row[3].toString().trim() : ""; record.amount = Number(row[4]) || 0; record.price = row[5] ? Number(row[5]) : undefined; record.date = formatDateSafe(row[6]); record.remarks = row[7] ? row[7].toString() : ""; record.minAmount = row[8] ? Number(row[8]) : undefined; record.maxAmount = row[9] ? Number(row[9]) : undefined; }
    else if (type === 'supply_trans') { record.supplySource = row[1] ? row[1].toString().toLowerCase().trim() : "general"; record.name = row[2] ? row[2].toString().trim() : ""; record.amount = Number(row[3]) || 0; record.date = formatDateSafe(row[4]); record.remarks = row[5] ? row[5].toString() : ""; }
    else if (type === 'cashflow') { record.amount = Number(row[1]) || 0; record.date = formatDateSafe(row[2]); record.remarks = row[3] ? row[3].toString() : ""; record.facebookId = row[4] ? row[4].toString() : ""; record.transactionType = row[5] ? row[5].toString().toLowerCase() : "income"; record.name = record.remarks || record.facebookId || "Transaction"; }
    else if (type === 'investors') { record.name = row[1] ? row[1].toString() : ""; record.bankName = row[2] ? row[2].toString() : ""; record.bankNumber = row[3] ? row[3].toString() : ""; record.amount = Number(row[4]) || 0; record.dateInvested = formatDateSafe(row[5]); record.percentPerMonth = Number(row[6]) || 0; record.amountPerMonth = Number(row[7]) || 0; }
    else { record.name = row[1] ? row[1].toString().trim() : ""; record.amount = Number(row[2]) || 0; record.date = formatDateSafe(row[3]); record.remarks = row[4] ? row[4].toString() : ""; record.facebookId = row[5] ? row[5].toString().trim() : ""; record.contactNumber = row[6] ? row[6].toString().trim() : ""; record.endDate = formatDateSafe(row[7]); record.status = row[8] ? row[8].toString().toLowerCase().trim() : "active"; record.transactionType = row[9] ? row[9].toString().toLowerCase().trim() : "no data"; record.tab = row[10] ? row[10].toString() : "no data"; }
    return record;
  }).filter(function(r) { return r !== null; });
}

function processSignature(formObject) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SIGNATURES_SHEET_NAME);
  if (!sheet) { sheet = ss.insertSheet(SIGNATURES_SHEET_NAME); ensureHeaders(sheet, 'signatures'); }
  
  var id = formObject.id;
  var draftId = formObject.draftId;
  var name = formObject.signer_name;
  var address = formObject.signer_address;
  var sig = formObject.signature;
  var date = new Date();
  
  var term = formObject.term || "";
  var period = formObject.period || "";
  var amountPerDue = formObject.amount_per_due || "";
  var amount = formObject.amount || "";
  var startDate = formObject.start_date || "";
  var endDate = formObject.end_date || "";
  var type = formObject.type || "";
  
  var data = sheet.getDataRange().getValues();
  var found = false;
  for (var i = SKIP_ROWS; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, 1, 1, 13).setValues([[id, name, address, date, sig, 'signed', term, period, amountPerDue, amount, startDate, endDate, type]]);
      found = true;
      break;
    }
  }
  if (!found) { safeAppend(sheet, [id, name, address, date, sig, 'signed', term, period, amountPerDue, amount, startDate, endDate, type]); }

  if (draftId) {
     var cSheet = ss.getSheetByName(CONTRACTS_SHEET_NAME);
     if (cSheet) {
        var cData = cSheet.getDataRange().getValues();
        for (var j = SKIP_ROWS; j < cData.length; j++) {
           if (cData[j][0] == draftId) {
              cSheet.getRange(j + 1, 4).setValue("signed");
              break;
           }
        }
     }
  }
  
  return { status: 'success' };
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (e.parameter.mode === 'sign') {
    var draftId = e.parameter.draftId;
    var draftData = null;
    var isExpired = false;
    
    if (draftId) {
       var cSheet = ss.getSheetByName(CONTRACTS_SHEET_NAME);
       if (cSheet) {
          var cData = cSheet.getDataRange().getValues();
          for(var i = SKIP_ROWS; i < cData.length; i++) {
             if(cData[i][0] == draftId) {
                if (cData[i][3] === "signed") {
                  isExpired = true;
                } else {
                  draftData = JSON.parse(cData[i][1]); 
                }
                break;
             }
          }
       }
    }

    if (isExpired) {
       return HtmlService.createHtmlOutput(
          '<div style="font-family:sans-serif; text-align:center; padding:50px;">' +
          '<h1 style="color:#e11d48;">Link Expired</h1>' +
          '<p>This agreement has already been signed and submitted.</p>' +
          '</div>'
       ).setTitle("Link Expired");
    }

    if (!draftData) {
       return HtmlService.createHtmlOutput("<h1>Invalid or Expired Link</h1>").setTitle("Error");
    }

    var html = getSigningPageHTML();
    html = html.replace('var SERVER_DATA = null;', 'var SERVER_DATA = ' + JSON.stringify(draftData) + ';');
    html = html.replace('var DRAFT_ID = null;', 'var DRAFT_ID = "' + draftId + '";');
    
    var output = HtmlService.createHtmlOutput(html)
      .setTitle("Digital Agreement")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');

    return output;
  }

  var configs = getTabConfigs(ss);
  var tabs = ss.getSheets().filter(function(s) { return !isSystemSheet(s.getName()); }).map(function(s) { return s.getName(); });
  var response = { 
    tabs: tabs, 
    tabTypes: configs.types, 
    currencyConfigs: configs.currencyConfigs, 
    appPin: configs.appPin,
    authorizedSignature: configs.authorizedSignature
  };
  
  var uSheet = ss.getSheetByName(USERS_SHEET_NAME);
  if (uSheet) response.users = getRecords(uSheet, 'users');

  var invSheet = ss.getSheetByName(INVESTORS_SHEET_NAME);
  if (invSheet) response.investors = getRecords(invSheet, 'investors');

  var hSheet = ss.getSheetByName(HISTORY_SHEET_NAME);
  if (hSheet) response.globalHistory = getRecords(hSheet, 'debt');

  var targetTab = e.parameter.tab;
  if (e.parameter.full === 'true') {
    response.allRecords = {};
    tabs.forEach(function(t) {
      try { 
        var sheet = ss.getSheetByName(t); 
        var type = configs.types[t];
        if (sheet) response.allRecords[t] = getRecords(sheet, type); 
      } catch(err) { response.allRecords[t] = []; }
    });
    var sigSheet = ss.getSheetByName(SIGNATURES_SHEET_NAME);
    if (sigSheet) {
      var sigs = getRecords(sigSheet, 'signatures');
      var sigMap = {};
      sigs.forEach(function(s) { sigMap[s.id] = s; });
      response.signatures = sigMap;
    }
  } else if (targetTab) {
    try { 
      var sheet = ss.getSheetByName(targetTab); 
      var type = e.parameter.type || configs.types[targetTab];
      if (!type && (targetTab.indexOf(" Incoming") !== -1 || targetTab.indexOf(" Outgoing") !== -1)) {
        type = 'supply_trans';
      }
      if (sheet) response.records = getRecords(sheet, type); 
    } catch(err) { response.records = []; }
  }
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var postData = JSON.parse(e.postData.contents);
  var action = postData.action;

  if (action === "saveContractDraft") {
    var sheet = ss.getSheetByName(CONTRACTS_SHEET_NAME);
    if (!sheet) { sheet = ss.insertSheet(CONTRACTS_SHEET_NAME); ensureHeaders(sheet, 'contracts'); }
    var draftId = "draft-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    safeAppend(sheet, [draftId, JSON.stringify(postData.data), new Date(), "pending"]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", draftId: draftId })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "saveAuthorizedSignature") {
    var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (!sheet) { sheet = ss.insertSheet(CONFIG_SHEET_NAME); ensureHeaders(sheet, 'config'); }
    var data = sheet.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === "authorizedSignature") { sheet.getRange(i + 1, 2).setValue(postData.signature); found = true; break; }
    }
    if (!found) sheet.appendRow(["authorizedSignature", postData.signature]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "saveMasterPin") {
    var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (!sheet) { sheet = ss.insertSheet(CONFIG_SHEET_NAME); ensureHeaders(sheet, 'config'); }
    var data = sheet.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === "appPin") { sheet.getRange(i + 1, 2).setValue(postData.pin.toString()); found = true; break; }
    }
    if (!found) sheet.appendRow(["appPin", postData.pin.toString()]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "saveGlobalMetrics") {
    var mSheet = ss.getSheetByName(METRICS_SHEET_NAME);
    if (!mSheet) { mSheet = ss.insertSheet(METRICS_SHEET_NAME); ensureHeaders(mSheet, 'metrics'); }
    var m = postData.metrics; var d = new Date();
    mSheet.getRange(SKIP_ROWS + 1, 1, 10, 5).clearContent();
    var rows = [
      ["DEBT", "Overdue Total", m.debt.overdue, "PHP", d], ["DEBT", "Today Total", m.debt.today, "PHP", d], ["DEBT", "Total Principal", m.debt.total, "PHP", d],
      ["RENT", "Month Schedule", m.rent.monthSchedule, "QTY", d], ["RENT", "Year Schedule", m.rent.yearSchedule, "QTY", d], ["RENT", "Yearly Realized", m.rent.yearEarnings, "PHP", d],
      ["CASH", "Total Incoming", m.flow.incoming, "PHP", d], ["CASH", "Total Outgoing", m.flow.outgoing, "PHP", d], ["CASH", "Net Balance", m.flow.net, "PHP", d], ["CASH", "In-Bank Total", m.flow.current, "PHP", d]
    ];
    mSheet.getRange(SKIP_ROWS + 1, 1, rows.length, 5).setValues(rows);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "addRecords") {
    var sheet = ss.getSheetByName(postData.tab);
    var type = getTabConfigs(ss).types[postData.tab];
    postData.records.forEach(function(r) {
      var row = [];
      if (type === 'salary') row = [r.id, r.date, r.endDate, r.amount, r.remarks];
      else if (type === 'business') row = [r.id, r.businessEntryType, r.name, r.amount, r.date, r.remarks];
      else if (type === 'savings') row = [r.id, r.transactionType, r.name, r.amount, r.date, r.status, r.remarks, r.actualAmount];
      else if (type === 'supply' || type === 'product') row = [r.id, 'income', r.name, r.itemCode, r.amount, r.price, r.date, r.remarks, r.minAmount, r.maxAmount];
      else if (type === 'cashflow') row = [r.id, r.amount, r.date, r.remarks, r.facebookId, r.transactionType, r.tab];
      else row = [r.id, r.name, r.amount, r.date, r.remarks, r.facebookId, r.contactNumber, r.endDate, r.status, r.transactionType, r.tab];
      safeAppend(sheet, row);
    });
    return ContentService.createTextOutput(JSON.stringify({ status: "success", records: getRecords(sheet, type) })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "updateRecord") {
    var sheet = ss.getSheetByName(postData.tab);
    var type = getTabConfigs(ss).types[postData.tab];
    var r = postData.record;
    var data = sheet.getDataRange().getValues();
    for (var i = SKIP_ROWS; i < data.length; i++) {
      if (data[i][0] == r.id) {
        var row = [];
        if (type === 'salary') row = [r.id, r.date, r.endDate, r.amount, r.remarks];
        else if (type === 'business') row = [r.id, r.businessEntryType, r.name, r.amount, r.date, r.remarks];
        else if (type === 'savings') row = [r.id, r.transactionType, r.name, r.amount, r.date, r.status, r.remarks, r.actualAmount];
        else if (type === 'supply' || type === 'product') row = [r.id, r.transactionType || 'income', r.name, r.itemCode, r.amount, r.price, r.date, r.remarks, r.minAmount, r.maxAmount];
        else if (type === 'cashflow') row = [r.id, r.amount, r.date, r.remarks, r.facebookId, r.transactionType, r.tab];
        else row = [r.id, r.name, r.amount, r.date, r.remarks, r.facebookId, r.contactNumber, r.endDate, r.status, r.transactionType, r.tab];
        sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", records: getRecords(sheet, type) })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteRecord") {
    var sheet = ss.getSheetByName(postData.tab);
    var data = sheet.getDataRange().getValues();
    var configs = getTabConfigs(ss);
    var tabType = configs.types[postData.tab] || 'debt';
    var deletedRecordName = "";
    var deletedRecordId = postData.id;
    
    // 1. Process deletion and history migration
    for (var i = SKIP_ROWS; i < data.length; i++) {
      if (data[i][0] == deletedRecordId) {
        deletedRecordName = data[i][1] ? data[i][1].toString().trim() : "";
        
        if (postData.status) {
          var hSheet = ss.getSheetByName(HISTORY_SHEET_NAME);
          if (!hSheet) { hSheet = ss.insertSheet(HISTORY_SHEET_NAME); ensureHeaders(hSheet, 'debt'); }
          var row = data[i].slice(); 
          row[8] = postData.status; 
          safeAppend(hSheet, row);
        }
        sheet.deleteRow(i + 1); 
        break;
      }
    }

    // 2. Signature Migration Logic
    var sigSheet = ss.getSheetByName(SIGNATURES_SHEET_NAME);
    if (sigSheet) {
      var sigData = sigSheet.getDataRange().getValues();
      var sigFoundIndex = -1;
      for (var j = SKIP_ROWS; j < sigData.length; j++) {
        if (sigData[j][0] == deletedRecordId) { sigFoundIndex = j; break; }
      }

      if (sigFoundIndex !== -1) {
        // If it's a Debt tab and we have a name, look for a successor record
        if (tabType === 'debt' && deletedRecordName !== "") {
          var newData = sheet.getDataRange().getValues();
          var successorId = "";
          for (var k = SKIP_ROWS; k < newData.length; k++) {
            // Find next entry for same alias
            if (newData[k][1] && newData[k][1].toString().trim() === deletedRecordName) {
              successorId = newData[k][0].toString();
              break;
            }
          }

          if (successorId !== "") {
            // Transfer signature ID to successor
            sigSheet.getRange(sigFoundIndex + 1, 1).setValue(successorId);
          } else {
            // Last record deleted: signature record is removed
            sigSheet.deleteRow(sigFoundIndex + 1);
          }
        } else {
          // Non-debt (Rent): signatures are ID-bound and deleted with record
          sigSheet.deleteRow(sigFoundIndex + 1);
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "addTab") {
    var sheet = ss.insertSheet(postData.tab); ensureHeaders(sheet, postData.type);
    var cSheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (!cSheet) { cSheet = ss.insertSheet(CONFIG_SHEET_NAME); ensureHeaders(cSheet, 'config'); }
    cSheet.appendRow(["type_" + postData.tab, postData.type]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "updateTab") {
    var oldTab = postData.oldTab;
    var newTab = postData.newTab;
    var sheet = ss.getSheetByName(oldTab); 
    if (sheet) sheet.setName(newTab);
    
    var cSheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (cSheet) {
      var data = cSheet.getDataRange().getValues();
      var typeFound = false;
      for (var i = 0; i < data.length; i++) {
        var key = data[i][0] ? data[i][0].toString() : "";
        if (key === "type_" + oldTab) { 
            cSheet.getRange(i + 1, 1, 1, 2).setValues([["type_" + newTab, postData.newType]]); 
            typeFound = true;
        } else if (key === "currency_" + oldTab) {
            cSheet.getRange(i + 1, 1).setValue("currency_" + newTab);
        }
      }
      if (!typeFound) {
         cSheet.appendRow(["type_" + newTab, postData.newType]);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteTab") {
    var tabName = postData.tab;
    var sheet = ss.getSheetByName(tabName); 
    if (sheet) ss.deleteSheet(sheet);
    
    var cSheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (cSheet) {
      var data = cSheet.getDataRange().getValues();
      for (var i = data.length - 1; i >= 0; i--) {
        var key = data[i][0] ? data[i][0].toString().trim() : "";
        if (key === "type_" + tabName || key === "currency_" + tabName) {
           cSheet.deleteRow(i + 1);
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "reorderTabs") {
    postData.tabs.forEach(function(t, idx) { var s = ss.getSheetByName(t); if (s) s.activate(); ss.moveActiveSheet(idx + 1); });
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "addUser" || action === "updateUser") {
    var uSheet = ss.getSheetByName(USERS_SHEET_NAME);
    if (!uSheet) { uSheet = ss.insertSheet(USERS_SHEET_NAME); ensureHeaders(uSheet, 'users'); }
    var u = postData.user; var data = uSheet.getDataRange().getValues(); var found = false;
    for (var i = SKIP_ROWS; i < data.length; i++) {
      if (data[i][0] == u.id) { uSheet.getRange(i + 1, 1, 1, 4).setValues([[u.id, u.username, u.password, JSON.stringify(u.restrictions)]]); found = true; break; }
    }
    if (!found) safeAppend(uSheet, [u.id, u.username, u.password, JSON.stringify(u.restrictions)]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteUser") {
    var uSheet = ss.getSheetByName(USERS_SHEET_NAME); var data = uSheet.getDataRange().getValues();
    for (var i = SKIP_ROWS; i < data.length; i++) { if (data[i][0] == postData.id) { uSheet.deleteRow(i + 1); break; } }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "addInvestor") {
    var invSheet = ss.getSheetByName(INVESTORS_SHEET_NAME);
    if (!invSheet) { invSheet = ss.insertSheet(INVESTORS_SHEET_NAME); ensureHeaders(invSheet, 'investors'); }
    var inv = postData.investor;
    safeAppend(invSheet, [inv.id, inv.name, inv.bankName, inv.bankNumber, inv.amount, inv.dateInvested, inv.percentPerMonth, inv.amountPerMonth]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", investors: getRecords(invSheet, 'investors') })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "addSupplyTransaction") {
    var subTab = postData.tab + (postData.transaction.transactionType === 'income' ? " Incoming" : " Outgoing");
    var sSheet = ss.getSheetByName(subTab);
    if (!sSheet) { sSheet = ss.insertSheet(subTab); ensureHeaders(sSheet, 'supply_trans'); }
    var tr = postData.transaction;
    safeAppend(sSheet, [tr.id, tr.supplySource, tr.name, tr.amount, tr.date, tr.remarks]);
    var mainSheet = ss.getSheetByName(postData.tab); var mRec = postData.updatedRecord; var mData = mainSheet.getDataRange().getValues();
    for (var j = SKIP_ROWS; j < mData.length; j++) {
      if (mData[j][0] == mRec.id) { mainSheet.getRange(j + 1, 5).setValue(mRec.amount); mainSheet.getRange(j + 1, 7).setValue(mRec.date); break; }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", records: getRecords(mainSheet, 'supply') })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "saveInitialBalance") {
    var sheet = ss.getSheetByName(postData.tab); if (sheet) sheet.getRange("A2").setValue(postData.balance);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "bulkReplaceRecords") {
    var sheet = ss.getSheetByName(postData.tab); var type = getTabConfigs(ss).types[postData.tab];
    var lastRow = sheet.getLastRow(); if (lastRow > SKIP_ROWS) sheet.deleteRows(SKIP_ROWS + 1, lastRow - SKIP_ROWS);
    postData.records.forEach(function(r) {
      var row = [];
      if (type === 'salary') row = [r.id, r.date, r.endDate, r.amount, r.remarks];
      else if (type === 'business') row = [r.id, r.businessEntryType, r.name, r.amount, r.date, r.remarks];
      else if (type === 'savings') row = [r.id, r.transactionType, r.name, r.amount, r.date, r.status, r.remarks, r.actualAmount];
      else row = [r.id, r.name, r.amount, r.date, r.remarks, r.facebookId, r.contactNumber, r.endDate, r.status, r.transactionType, r.tab];
      safeAppend(sheet, row);
    });
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "scrubPersonFromHistory") {
    var hSheet = ss.getSheetByName(HISTORY_SHEET_NAME);
    if (hSheet) {
      var data = hSheet.getDataRange().getValues();
      var targetName = postData.name.toLowerCase().trim();
      var exceptId = postData.exceptId;
      for (var i = data.length - 1; i >= SKIP_ROWS; i--) {
        var rowName = data[i][1] ? data[i][1].toString().toLowerCase().trim() : "";
        var rowId = data[i][0];
        if (rowName === targetName && rowId !== exceptId) {
           hSheet.deleteRow(i + 1);
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "deleteHistoryById") {
    var hSheet = ss.getSheetByName(HISTORY_SHEET_NAME);
    if (hSheet) {
      var data = hSheet.getDataRange().getValues();
      for (var i = SKIP_ROWS; i < data.length; i++) {
        if (data[i][0] == postData.id) { hSheet.deleteRow(i + 1); break; }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "bulkUpdateHistory") {
    var hSheet = ss.getSheetByName(HISTORY_SHEET_NAME);
    if (!hSheet) { hSheet = ss.insertSheet(HISTORY_SHEET_NAME); ensureHeaders(hSheet, 'debt'); }
    var lastRow = hSheet.getLastRow(); if (lastRow > SKIP_ROWS) hSheet.deleteRows(SKIP_ROWS + 1, lastRow - SKIP_ROWS);
    postData.history.forEach(function(r) {
      var row = [r.id, r.name, r.amount, r.date, r.remarks, r.facebookId, r.contactNumber, r.endDate, r.status, r.transactionType, r.tab];
      safeAppend(hSheet, row);
    });
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "updateUserPassword") {
    var uSheet = ss.getSheetByName(USERS_SHEET_NAME);
    if (uSheet) {
      var data = uSheet.getDataRange().getValues();
      var targetUser = postData.username.toLowerCase();
      for (var i = SKIP_ROWS; i < data.length; i++) {
        if (data[i][1].toString().toLowerCase() == targetUser) {
          uSheet.getRange(i + 1, 3).setValue(postData.newPassword);
          break;
        }
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "saveCurrencyConfig") {
    var cSheet = ss.getSheetByName(CONFIG_SHEET_NAME);
    if (!cSheet) { cSheet = ss.insertSheet(CONFIG_SHEET_NAME); ensureHeaders(cSheet, 'config'); }
    var key = "currency_" + postData.tab;
    var data = cSheet.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === key) { cSheet.getRange(i + 1, 2).setValue(JSON.stringify(postData.config)); found = true; break; }
    }
    if (!found) cSheet.appendRow([key, JSON.stringify(postData.config)]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
}

function getSigningPageHTML() {
  return '<!DOCTYPE html>' + 
  '<html lang="en" prefix="og: http://ogp.me/ns#">' +
  '<head>' +
  '<base target="_top">' +
  '<meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">' +
  '<title>Nica.Lmk.Corp Agreement</title>' +
  
  // SEO / Crawler Tags
  '<meta name="description" content="Please review and sign this secure document. Tap here to open.">' +
  
  // Open Graph / Facebook (Force Large Card)
  '<meta property="og:type" content="article">' +
  '<meta property="og:title" content="Digital Agreement | Nica Lmk Corp">' +
  '<meta property="og:description" content="Please review and sign this secure document. Tap here to open.">' +
  '<meta property="og:image" content="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80">' +
  '<meta property="og:image:width" content="1200">' +
  '<meta property="og:image:height" content="630">' +
  '<meta property="og:site_name" content="Nica Lmk Corp Infrastructure">' +
  
  // Twitter
  '<meta name="twitter:card" content="summary_large_image">' +
  '<meta name="twitter:title" content="Digital Agreement | Nica Lmk Corp">' +
  '<meta name="twitter:description" content="Please review and sign this secure document. Tap here to open.">' +
  '<meta name="twitter:image" content="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80">' +
  
  // Google / Schema.org
  '<meta itemprop="name" content="Digital Agreement | Nica Lmk Corp">' +
  '<meta itemprop="description" content="Please review and sign this secure document. Tap here to open.">' +
  '<meta itemprop="image" content="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80">' +

  '<style>' +
  '* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }' +
  'html, body { width: 100%; overflow-x: hidden; margin: 0; padding: 0; }' +
  'body { font-family: sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; padding-bottom: 50vh; min-height: 100vh; }' +
  '.container { width: 100%; max-width: 450px; background: white; border-radius: 24px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); margin: 0 auto; position: relative; }' +
  'h1 { font-size: 20px; margin: 0 0 4px 0; color: #0f172a; }' +
  '.section { margin-bottom: 20px; }' +
  '.label { display: block; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }' +
  'input { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; box-sizing: border-box; font-size: 14px; }' +
  'canvas { border: 2px dashed #cbd5e1; border-radius: 16px; width: 100%; height: 160px; background: #fff; touch-action: none; }' +
  '.btn { display: block; width: 100%; padding: 16px; background: #0f172a; color: white; border: none; border-radius: 16px; cursor: pointer; margin-top: 10px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }' +
  '.hidden { display: none !important; }' +
  '.terms-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 10000; display: flex; flex-direction: column; padding: 24px; box-sizing: border-box; }' +
  '.terms-content { height: 100%; display: flex; flex-direction: column; max-width: 500px; margin: 0 auto; width: 100%; }' +
  '.terms-text { flex: 1; overflow-y: auto; font-size: 13px; line-height: 1.6; color: #334155; margin: 20px 0; white-space: pre-wrap; padding-right: 10px; border-top: 1px solid #f1f5f9; padding-top: 15px; }' +
  '.terms-footer { display: flex; gap: 12px; padding-top: 20px; border-top: 1px solid #e2e8f0; }' +
  '.warning-box { background: #fff1f2; border: 1px solid #fecdd3; padding: 12px; border-radius: 12px; margin-bottom: 15px; }' +
  '.warning-text { font-size: 11px; font-weight: bold; color: #e11d48; line-height: 1.4; text-align: center; margin: 0; }' +
  '.details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f1f5f9; padding: 16px; border-radius: 16px; margin-bottom: 20px; }' +
  '.detail-item p { margin: 2px 0 0 0; font-size: 13px; font-weight: 700; color: #1e293b; }' +
  '</style></head><body><div class="container" id="main"><div style="text-align:center; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid #f1f5f9;"><h1 style="font-size:28px; font-weight:900; margin:0; letter-spacing:-0.02em; color:#0f172a;">Nica.<span style="color:#db2777;">Lmk</span>.Corp</h1><p style="font-size:8px; font-weight:800; color:#94a3b8; margin:4px 0 0 0; letter-spacing:0.4em; text-transform:uppercase;">Corporate Infrastructure</p></div><h1>Official Agreement</h1><h2 id="docTitle" style="font-size:14px; color:#64748b; margin-bottom:20px;"></h2><div id="detailsSection" class="details-grid hidden"><div id="debtDetails" class="hidden" style="display:contents;"><div class="detail-item"><span class="label">Lender</span><p id="dispLender">---</p></div><div class="detail-item"><span class="label">Installment</span><p id="dispTerm">---</p></div><div class="detail-item"><span class="label">Term Period</span><p id="dispPeriod">---</p></div><div class="detail-item"><span class="label">Amt Per Due</span><p id="dispPerDue" style="color:#059669;">---</p></div></div><div id="rentDetails" class="hidden" style="display:contents;"><div class="detail-item" style="grid-column: span 2;"><span class="label">Operator</span><p id="dispOperator">---</p></div><div class="detail-item"><span class="label">Vehicle</span><p id="dispModel">---</p></div><div class="detail-item"><span class="label">Plate No.</span><p id="dispPlate">---</p></div><div class="detail-item"><span class="label">Start Date</span><p id="dispStart">---</p></div><div class="detail-item"><span class="label">End Date</span><p id="dispEnd">---</p></div><div class="detail-item" style="grid-column: span 2;"><span class="label">Driver Mode</span><p id="dispDriver" style="color:#2563eb;">---</p></div></div></div><div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 16px; padding: 16px; margin-bottom: 24px;"><p style="margin: 0; font-size: 13px; font-weight: 600; color: #1e40af; line-height: 1.5; text-align: center;">Please fill-up your name and address below.<br>Read the terms and condition carefully and click agree.</p></div><div id="infoSection" class="section"><span class="label">Principal Amount</span><input type="text" id="dispAmount" readonly><span class="label" style="margin-top:15px">Signer Name</span><input type="text" id="signerName" placeholder="Enter Full Name"><span class="label" style="margin-top:15px">Address</span><input type="text" id="signerAddress" placeholder="Enter Complete Address"><button class="btn" id="viewTermsBtn" style="margin-top:30px; background:#2563eb;" onclick="showTerms()">Review Terms & Conditions</button></div><div class="section hidden" id="sigSection"><div class="warning-box"><p class="warning-text">Please ensure your signature is clear and consistent with the one used in your official public documents. Please be advised that intentional falsification of a signature is a punishable offense under the law.</p></div><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;"><span class="label" style="margin:0">Signature Pad</span><span style="font-size:10px; color:#10b981; font-weight:bold;">Terms Accepted ✓</span></div><canvas id="sigCanvas"></canvas><button class="btn" style="background:#f1f5f9; color:#64748b" onclick="clearCanvas()">Clear</button><button class="btn" onclick="submitForm()" id="submitBtn">Sign & Submit</button></div></div><div id="termsOverlay" class="terms-overlay hidden"><div class="terms-content"><h1>Contract Terms</h1><p style="font-size:11px; color:#64748b;">Please review the agreement carefully before signing.</p><div class="terms-text" id="termsText"></div><div class="terms-footer"><button class="btn" onclick="cancelTerms()" style="background:#f1f5f9; color:#64748b; margin-top:0; width:30%;">Back</button><button class="btn" onclick="agreeTerms()" style="background:#10b981; margin-top:0; flex:1;">I Agree</button></div></div></div><div id="success" class="hidden" style="text-align:center; padding-top:100px; max-width:400px; margin:0 auto; padding-left:20px; padding-right:20px;"><div style="font-size:60px; margin-bottom:20px;">✅</div><h1>Signed Successfully</h1><p style="color:#64748b; line-height:1.6;">The document has been verified and stored. You may now close this window.</p></div><script>var SERVER_DATA = null; var DRAFT_ID = null; var canvas = document.getElementById("sigCanvas"); var ctx = canvas.getContext("2d"); var isDrawing = false; function resizeCanvas() { var ratio = Math.max(window.devicePixelRatio || 1, 1); canvas.width = canvas.offsetWidth * ratio; canvas.height = canvas.offsetHeight * ratio; ctx.scale(ratio, ratio); } window.onresize = resizeCanvas; setTimeout(resizeCanvas, 500); function startDraw(e) { e.preventDefault(); isDrawing = true; var rect = canvas.getBoundingClientRect(); var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; var y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top; ctx.beginPath(); ctx.moveTo(x, y); } function draw(e) { if(!isDrawing) return; e.preventDefault(); var rect = canvas.getBoundingClientRect(); var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; var y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top; ctx.lineTo(x, y); ctx.stroke(); } function endDraw() { isDrawing = false; } canvas.addEventListener("mousedown", startDraw); canvas.addEventListener("mousemove", draw); canvas.addEventListener("mouseup", endDraw); canvas.addEventListener("touchstart", startDraw, {passive:false}); canvas.addEventListener("touchmove", draw, {passive:false}); canvas.addEventListener("touchend", endDraw); function clearCanvas() { ctx.clearRect(0,0,canvas.width,canvas.height); } function showTerms() { var n = document.getElementById("signerName").value; var a = document.getElementById("signerAddress").value; if(!n || !a) { alert("Please fill up Signer Name and Address first."); return; } document.getElementById("termsOverlay").classList.remove("hidden"); } function agreeTerms() { document.getElementById("termsOverlay").classList.add("hidden"); document.getElementById("infoSection").classList.add("hidden"); document.getElementById("sigSection").classList.remove("hidden"); resizeCanvas(); } function cancelTerms() { document.getElementById("termsOverlay").classList.add("hidden"); } var params = SERVER_DATA || {}; if (params.type === "rent") { document.getElementById("detailsSection").classList.remove("hidden"); document.getElementById("rentDetails").classList.remove("hidden"); document.getElementById("dispOperator").textContent = params.operator || "Nica Lmk Corp"; document.getElementById("dispModel").textContent = params.car_model || "---"; document.getElementById("dispPlate").textContent = params.plate_number || "---"; document.getElementById("dispStart").textContent = params.date || "---"; document.getElementById("dispEnd").textContent = params.end_date || "---"; document.getElementById("dispDriver").textContent = params.driver_option === "with_driver" ? "Authorized Driver Included" : "Self-Drive (Client)"; } else if (params.type !== "investor") { document.getElementById("detailsSection").classList.remove("hidden"); document.getElementById("debtDetails").classList.remove("hidden"); document.getElementById("dispLender").textContent = params.lender_name || "Lmk Corp"; document.getElementById("dispTerm").textContent = params.term || "Weekly"; document.getElementById("dispPeriod").textContent = params.period || "---"; document.getElementById("dispPerDue").textContent = params.amount_per_due ? "₱" + params.amount_per_due : "---"; } document.getElementById("docTitle").textContent = params.type === "rent" ? "Rental Contract" : (params.type === "investor" ? "Investment Agreement" : "Loan Agreement"); document.getElementById("dispAmount").value = params.amount ? "₱" + params.amount : "0"; document.getElementById("termsText").textContent = params.terms_content || ""; function submitForm() { var sig = canvas.toDataURL("image/png"); if (sig.length < 1000) { alert("Please provide a signature."); return; } var btn = document.getElementById("submitBtn"); btn.disabled = true; btn.textContent = "Processing..."; google.script.run.withSuccessHandler(function(){ document.getElementById("main").classList.add("hidden"); document.getElementById("success").classList.remove("hidden"); }).processSignature({ id: params.id, draftId: DRAFT_ID, signer_name: document.getElementById("signerName").value, signer_address: document.getElementById("signerAddress").value, signature: sig, term: params.term || "", period: params.period || "", amount_per_due: params.amount_per_due || "", amount: params.amount || "", start_date: params.date || "", end_date: params.end_date || "", type: params.type || "" }); } function handleScrollIntoView(e) { setTimeout(function(){ e.target.scrollIntoView({behavior:"smooth",block:"center"}); }, 400); } var inputs = document.querySelectorAll("input"); for(var i=0;i<inputs.length;i++){ inputs[i].addEventListener("focus", handleScrollIntoView); inputs[i].addEventListener("click", handleScrollIntoView); } if (window.visualViewport) { window.visualViewport.addEventListener("resize", function() { var active = document.activeElement; if (active && active.tagName === "INPUT") { active.scrollIntoView({behavior:"smooth",block:"center"}); } }); } </script></body></html>';
}
`;

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, initialScriptUrl, themeColor = '#db2777' }) => {
  const [mode, setMode] = useState<'select' | 'master' | 'user'>('select');
  const [scriptUrl, setScriptUrl] = useState(initialScriptUrl || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewPin, setIsNewPin] = useState(false);
  const [isGreenGlow, setIsGreenGlow] = useState(false);

  useEffect(() => {
    setScriptUrl(initialScriptUrl || '');
  }, [initialScriptUrl]);

  const resetError = () => { setError(null); setIsNewPin(false); };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(DEPLOYMENT_SCRIPT);
    setIsGreenGlow(true);
    setTimeout(() => setIsGreenGlow(false), 2000);
  };

  const handleMasterAuth = async () => {
    if (!scriptUrl) { setError('Script URL is required'); return; }
    setIsLoading(true);
    resetError();
    try {
      const res = await fetch(`${scriptUrl}?tab=_TabConfigs_`);
      const data = await res.json();
      const cloudPin = data.appPin;
      if (!cloudPin) {
        setIsNewPin(true);
        setIsLoading(false);
        return;
      }
      if (pin === cloudPin) {
        onLogin({ role: 'master', password: pin, isOffline: false }, scriptUrl);
      } else if (!pin) {
      } else {
        setError('Incorrect Master PIN');
      }
    } catch (e) {
      setError('Could not connect to Cloud. Check URL and Network.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePin = async () => {
    if (pin.length < 4) { setError('PIN must be at least 4 digits'); return; }
    setIsLoading(true);
    try {
      const res = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'saveMasterPin', pin })
      });
      const data = await res.json();
      if (data.status === 'success') {
        onLogin({ role: 'master', password: pin, isOffline: false }, scriptUrl);
      } else {
        throw new Error();
      }
    } catch (e) {
      setError('Failed to initialize security. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAuth = async () => {
    if (!scriptUrl) { setError('Script URL is required'); return; }
    if (!username || !password) { setError('Enter credentials'); return; }
    setIsLoading(true);
    resetError();
    try {
      const res = await fetch(`${scriptUrl}?tab=_TabConfigs_`);
      const data = await res.json();
      const users: AppUser[] = data.users || [];
      const found = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      if (found) {
        let allowed: string[] = [];
        let perms: Record<string, string[]> = {};
        if (Array.isArray(found.restrictions)) {
          allowed = found.restrictions;
        } else if (found.restrictions && typeof found.restrictions === 'object') {
          const restrictionsObj = found.restrictions as { allowedTabs: string[], tabPermissions: Record<string, string[]> };
          allowed = restrictionsObj.allowedTabs || [];
          perms = restrictionsObj.tabPermissions || {};
        }
        onLogin({ role: 'user', username: found.username, password: found.password, allowedTabs: allowed, tabPermissions: perms, isOffline: false }, scriptUrl);
      } else {
        setError('Invalid Username or Password');
      }
    } catch (e) {
      setError('Authentication failed. Check Network.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineMode = () => {
    onLogin({ role: 'master', isOffline: true, password: '0609' }, '');
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.target instanceof HTMLElement) e.target.blur();
      action();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-50 flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] blur-[120px] rounded-full opacity-10 animate-pulse" style={{ backgroundColor: themeColor }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] blur-[120px] rounded-full opacity-10 animate-pulse" style={{ backgroundColor: themeColor, animationDelay: '1.5s' }} />
      </div>

      <div className="w-full max-sm relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-6 duration-1000">
          <button onClick={handleCopyScript} className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white overflow-hidden relative group transition-all duration-500 ${isGreenGlow ? 'shadow-[0_0_40px_rgba(16,185,129,0.8)] scale-110' : 'shadow-slate-200/50'}`} style={{ backgroundColor: isGreenGlow ? '#10b981' : themeColor }} title="Click to copy deployment script">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-white"><ShieldIcon /></div>
          </button>
          <h1 className="text-4xl font-black tracking-tighter mb-2 text-slate-900 drop-shadow-sm">Nica.<span className="animate-glow-text" style={{ color: themeColor, textShadow: `0 0 15px ${themeColor}44` }}>lmk</span>.Corp</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Infrastructure Division</p>
        </div>

        {mode === 'select' && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-500">
            <button onClick={() => setMode('master')} className="w-full group p-5 bg-white border border-slate-200 rounded-[2rem] flex items-center gap-4 hover:border-slate-300 transition-all active:scale-[0.98] shadow-lg shadow-slate-200/40">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform text-white" style={{ backgroundColor: themeColor }}><ShieldIcon /></div>
              <div className="text-left"><p className="text-slate-900 font-black text-lg leading-tight">Corporate Admin</p><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Cloud Sync & Users</p></div>
            </button>
            <button onClick={() => setMode('user')} className="w-full group p-5 bg-white border border-slate-200 rounded-[2rem] flex items-center gap-4 hover:border-slate-300 transition-all active:scale-[0.98] shadow-lg shadow-slate-200/40">
              <div className="w-14 h-14 bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:-rotate-6 transition-transform"><UserIcon /></div>
              <div className="text-left"><p className="text-slate-900 font-black text-lg leading-tight">Corporate Staff</p><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">Shared Ledger Access</p></div>
            </button>
            <div className="py-2 flex items-center gap-4"><div className="h-px flex-1 bg-slate-200" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Isolated Zone</span><div className="h-px flex-1 bg-slate-200" /></div>
            <button onClick={handleOfflineMode} className="w-full group p-5 bg-slate-100 border border-slate-200 rounded-[2rem] flex items-center gap-4 hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm">
              <div className="w-14 h-14 bg-white text-slate-400 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"><CloudOffIcon /></div>
              <div className="text-left"><p className="text-slate-800 font-black text-lg leading-tight">Personal Ledger</p><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">Private Use • Strictly Offline</p></div>
            </button>
          </div>
        )}

        {(mode === 'master' || mode === 'user') && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-300/40 border border-slate-100 animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-8">
              <div><h2 className="text-xl font-black text-slate-900 leading-none">{mode === 'master' ? 'Enterprise Admin' : 'Staff Login'}</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Cloud Authentication</p></div>
              <button onClick={() => { setMode('select'); resetError(); }} className="text-[10px] font-black uppercase tracking-widest py-2 px-3 bg-slate-50 rounded-xl transition-all active:scale-90" style={{ color: themeColor }}>Back</button>
            </div>
            <div className="space-y-5">
              {!initialScriptUrl && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><LinkIcon /> Corporate Endpoint</label>
                  <input type="password" placeholder="Enter Master URL" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 transition-all" value={scriptUrl} onChange={e => setScriptUrl(e.target.value)} onKeyDown={e => handleKeyDown(e, mode === 'master' ? (isNewPin ? handleCreatePin : handleMasterAuth) : handleUserAuth)} />
                </div>
              )}
              {mode === 'master' ? (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><KeyIcon /> {isNewPin ? 'Create Master PIN' : 'Access Passcode'}</label>
                  <input type="password" inputMode="numeric" placeholder={isNewPin ? "Set 4-digit PIN" : "****"} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl font-black tracking-[0.5em] outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 shadow-inner" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} onKeyDown={e => handleKeyDown(e, isNewPin ? handleCreatePin : handleMasterAuth)} />
                  {isNewPin && <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest text-center mt-3 bg-amber-50 py-2 rounded-xl border border-amber-100">New Cloud detected. Create a PIN.</p>}
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff Username</label>
                    <input type="text" placeholder="Username" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => handleKeyDown(e, handleUserAuth)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff Password</label>
                    <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => handleKeyDown(e, handleUserAuth)} />
                  </div>
                </>
              )}
              {error && <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl animate-in shake duration-300"><p className="text-rose-600 text-[10px] font-black text-center uppercase tracking-tight">{error}</p></div>}
              <button onClick={mode === 'master' ? (isNewPin ? handleCreatePin : handleMasterAuth) : handleUserAuth} disabled={isLoading} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 mt-4 relative overflow-hidden">{isLoading && <div className="absolute inset-0 bg-white/10 animate-pulse" />}{isLoading ? 'Verifying...' : isNewPin ? 'Save Master PIN' : 'Unlock Database'}</button>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-40">
        <div className="h-0.5 w-10 bg-slate-300 rounded-full mb-1" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Lmk.Corp Infrastructure v202.11</p>
      </div>

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .shake { animation: shake 0.2s ease-in-out 2; }
      `}</style>
    </div>
  );
};

export default LoginScreen;
