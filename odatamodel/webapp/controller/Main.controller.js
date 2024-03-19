sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"    
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, JSONModel) {
        "use strict";
        
        return Controller.extend("sync.e25.odatamodel.controller.Main", {
            initAirlineData: {
                Carrid: "",
                Carrname: "",
                Currcode: "",
                Url: ""
            },
            
            onInit: function () {
                let data = this.initAirlineData;
                let oNewModel = new JSONModel(data);
                let oView = this.getView();
                oView.setModel(oNewModel, "new");

                // 통화코드 콤보박스를 위해 추가
                let viewData = {
                    Currency: [
                        {key: 'KRW', name: '원화'},
                        {key: 'USD', name: '달러'}
                    ]
                };
                let oViewModel = new JSONModel(viewData);
                oView.setModel(oViewModel, "view");
            },

            onCurrencyChange: function (oEvent) {
                let currency = oEvent.getParameter("value");
                let oNewModel = this.getView().getModel("new");
                oNewModel.setProperty("/Currcode", oItem.getKey());
            },
            
            onCreate: function () {
                let oView = this.getView();
                let oDialog = oView.byId("idNewDialog");

                if (oDialog) {
                    oDialog.open();
                } else {
                    Fragment.load({
                        id: oView.getId(),
                        name:"sync.e25.odatamodel.view.New",
                        type: "XML",
                        controller: this                // View의 Controller를 공유
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);    // View의 Model을 공유
                        oDialog.open();
                    });
                }
            },

            onSaveCancel: function () {
                let oDialog = this.getView().byId("idNewDialog");
                if (oDialog) {
                    oDialog.close();
                }

                // 빈값만 있는 정보로 기존의 new 모델의 데이터를 교체해버림 =>> 데이터 초기화
                let oNewModel = this.getView().getModel("new");
                oNewModel.setData({
                    Carrid: "",
                    Carrname: "",
                    Currcode: "",
                    Url: ""
                });

                // ComboBox 선택된 내용을 지우는 과정
                let oComboBox = this.byId("idComboBox");
                oComboBox.setSelectedKey("");
                oComboBox.setSelectedItem("");
                oComboBox.setSelectedItemId("");
            },

            onSaveConfirm: function () {
                let oView = this.getView();
                let oNewModel = oView.getModel("new");  // JSON  Model
                let oModel = oView.getModel();          // OData Model
                
                let newData = oNewModel.getData();
                //newData = { Carrid:"~~", Carrname:"~~~", ...}
                
                

                // HTTP Method 에서 POST 방식으로 호출하는 방법
                oModel.create(
                    // 경로, 신규데이터, 결과처리
                    "/CarrierSet",
                    newData,
                    {
                        success: function (oData, oResponse) {
                            // oData : 생성된 데이터 내용
                            // oResponse : 응답결과
                            
                            sap.m.MessageToast.show( oData.Carrid + "항공사가 생성되었습니다.");
                        },
                        error: function ( oError ) {
                            
                            sap.m.MessageBox.error("생성 중 오류가 발생되었습니다.");
                        }
                    }
                );
            },

            onDelete: function ( oEvent ) {
                // oEvent의 getSource() 는 이벤트가 발생한 오브젝트를 의미
                // debugger;
                let oButton = oEvent.getSource();   // 특정 라인의 버튼
                let oContext = oButton.getBindingContext(); // 그 버튼에 연결된 Model 정보
                let path = oContext.getPath(); // Model 정보의 경로 ( /CarrierSet('AA') )

                let oView = this.getView();
                let oModel = oView.getModel();

                // HTTP Method 에서 Delete 에 해당하는 명령
                oModel.remove(
                    // 삭제할 데이터의 경로, 결과처리
                    path, {
                    success: function(){
                        sap.m.MessageToast.show("항공사 삭제됨");
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("삭제 중 오류가 발생함.");
                    }
                })
            }
        });
    });
