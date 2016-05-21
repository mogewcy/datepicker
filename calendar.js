/*
* @Author: 浴火小青春
* @Date:   2016-05-21
* @Last Update:2016-05-21
* @Email:wcy.moge@gmail.com
* @Version: 0.1
*/
(function(window,document){

function  Calendar(options){

      this.id=options.id;// 整个容器的id
      this.inputId=options.inputId;//获取时间的文本框的id
      this.tableId=options.tableId;//日历的表格的id
      
      this.dayHeadFormat=options.dayHeadFormat;//周几显示的格式，例如是显示周一到周五还是Sunday~Monday
      this.tableClassName=options.tableClassName;//日历表格的类名
      this.defaultDate=options.defaultDate||new Date().format('yyyy/mm/dd');//默认选中的日期，若为空，则显示当日的日期
      this.isLimitedRange=options.isLimitedRange;//限定的时间段，日期只能在这个范围中选择
      this.startDate=options.startDate||null;//限定时间段的开始时间
      this.endDate=options.endDate||null;//限定时间段的结束时间
      this.isSelectRange=options.isSelectRange;//选择时间范围还是选择某一天
      if(this.isSelectRange){//设定选择时间范围时的跨度
        this.minRangeLen=options.minRangeLen;
        this.maxRangeLen=options.maxRangeLen;
      }
      
      this.onSelected=options.onSelected||function(){};//选中日期后的回调函数，点击确定按钮后执行

      this.hasChoosed=false;//选择某一天时，是否已经选择过了日期
      this.chooseDate=[0,0,0];//选择某一天时，选中的日期，初始为空

      this.firstDate=[0,0,0];//选择时间范围时，选中的开始时间
      this.secondDate=[0,0,0];//选择时间范围时，选中的结尾时间
      this.init();
}
Calendar.prototype={
        init:function(){
             this.cacheDom();
             this.loadCss();
             this.bindEvents();
             this.setDefaultTime();
             this.render();
      },
      /**
       * 创建日历table的DOM结构
       */
      createTableDom:function(){
           var tableHtml="";
           for(var i=0;i<7;i++){
              tableHtml+='<tr>';
              for(var j=0;j<6;j++){
                  if(i==0){
                     tableHtml+='<th>'+this.dayHeadFormat[j]+'</th>';
                  }else{
                     tableHtml+='<td></td>'
                  }
              }
              tableHtml+='</tr>';
           }
           return tableHtml;
      },
      cacheDom:function(){
           this.container=document.getElementById(this.id);
           this.input=document.getElementById(this.inputId);
           this.myTable=document.getElementById(this.tableId);
 
           this.myTable.className=this.tableClassName;
           this.myTable.innerHTML=this.createTableDom();

           this.day=this.container.querySelector('.day');
           this.month=this.container.querySelector('.month');
           this.year=this.container.querySelector('.year');

           this.dayContainer=this.container.querySelector('.day-list');
           this.dayLists=this.dayContainer.getElementsByTagName('td');
 
           this.addYearBtn=this.container.querySelector('.add-year');
           this.delYearBtn=this.container.querySelector('.del-year');
           this.addMonthBtn=this.container.querySelector('.add-month');
           this.delMonthBtn=this.container.querySelector('.del-month');

           this.okBtn=this.container.querySelector('.ok-btn');
           this.cancelBtn=this.container.querySelector('.cancel-btn');
           
           
     },
     /**
      *  动态引入日历的样式文件
      */
     loadCss:function(){
           var link=document.createElement('link');
           link.type='text/css';
           link.rel='stylesheet';
           link.href='calendar.css';
           document.head.appendChild(link);
     },
     bindEvents:function(){
           var self=this;
           // 对月份和年份的增减的事件监听
           this.delMonthBtn.addEventListener('click',function(e){
                    (self.month.innerHTML=='1')?((self.year.innerHTML--)&&(self.month.innerHTML='12')):(self.month.innerHTML--);
                     self.render();
                     
            },false);
            this.addMonthBtn.addEventListener('click',function(e){
                    (self.month.innerHTML=='12')?((self.year.innerHTML++)&&(self.month.innerHTML='1')):(self.month.innerHTML++);
                    self.render();
            },false);

           this.delYearBtn.addEventListener('click',function(e){
                    self.year.innerHTML--;
                    self.render();
            },false);
            this.addYearBtn.addEventListener('click',function(e){
                   self.year.innerHTML++;
                   self.render();
            },false);
            //事件代理，监听到单个日期上的点击事件
            this.dayContainer.addEventListener('click',function(e){
                 var e=e||window.event;
                 if(e.target.tagName.toLowerCase()=='td'&&e.target.innerHTML){
                     self.hasChoosed=true;
                     var date=self.year.innerHTML+'/'+self.month.innerHTML+'/'+e.target.innerHTML;
                     if(self.isLimitedRange){//如果限制了范围，就要判断选中的日期在不在范围之内
                         if(compareDate(date,self.startDate)&&compareDate(self.endDate,date)||(date==self.startDate)||(date==self.endDate)){
                               doAction(self,e.target);
                         }else{
                               alert('你选择的日期不在设定范围内');
                         }
                    }else{//没有选中范围，直接选择
                               doAction(self,e.target);
                    }
                 }
            },false);
            // 文本框焦点切换对应日历的显示和隐藏
            this.input.addEventListener('focus',function(){
                   if(self.isShow(self.container)){
                        self.hide(self.container);
                   }else{
                        self.show(self.container);
                   }
            },false);

            this.okBtn.addEventListener('click',function(e){
                  if(self.isSelectRange){  //设置了选择日期范围
                      if(self.chargeDiffDayinRange()){//开始结束时间的范围在设定的跨度中
                          if(compareDate(self.firstDate.join('/'),self.secondDate.join('/'))){//第一次选择的时间大于第二次选择的时间
                                alert(self.secondDate+'到'+self.firstDate);
                                //文本框中显示选择的日期范围
                                self.input.value=self.secondDate+'到'+self.firstDate;
                          }else{
                               alert(self.firstDate+'到'+self.secondDate);
                               self.input.value=self.firstDate+'到'+self.secondDate;
                          }
                          self.hide(self.container);
                      }else if(self.secondDate[0]===0){//规定选择时间段的时候，只选择了一个日期就点击了ok按钮
                           alert('请选择了两个日期后再点击确定按钮');
                      }else{
                        alert("选择的时间长度不在跨度内,请重新选择");
                        self.firstDate=self.secondDate=[0,0,0];
                        self.clearChoosedStyle();
                        self.clearDayInRangeStyle();
                      }
                   }else{
                      self.hide(self.container);
                   }
                   // 选中日期后的回调函数
                   self.onSelected();
            },false);
            /**
             * 点击取消按钮日历隐藏
             */
            this.cancelBtn.addEventListener('click',function(e){
                 self.hide(self.container);
            },false);
     },
     /**
      * @param  {object}  ele dom对象
      * @return {Boolean}    判断dom对象是否隐藏
      */
     isShow:function(ele){
              if(ele.style.display=='block'){
                return true;
              }
              return false;
     },
     /**
      * 清空掉选择的日期的样式
      */
     clearChoosedStyle:function(){
         var allHasChoosedEle=document.querySelectorAll('.td-choosed');
           for(var i=0,len=allHasChoosedEle.length;i<len;i++){
               allHasChoosedEle[i].classList.remove('td-choosed');
           }
     },
    /**
     * @param  {string} year  年份
     * @param  {string} month 月份
     * @param  {string} day   号
     * @return {object}  message
     * message{
     * year   年份
     * month  月份
     * monthLen  那个月的天数
     * whichDay  1号是周几
     * day       号
     * }    
     */
     calculate:function(year,month,day){
     	        var date=year+'/'+month+'/'+'1';
     	        var whichDay=new Date(date).getDay();
              var message={
                    year:year,
                    month:month,
                    monthLen:new Date(year,month,0).getDate(),
                    whichDay:whichDay,
                    day:day
              };
              return message;
     },
     hide:function(ele){
           ele.style.display='none';
     },
     show:function(ele){
           ele.style.display='block';
     },
     /**
      * 清理掉所有单元格的内容和背景色
      */
     clearBackGround:function(){
            for(var i=0,len=this.dayLists.length;i<len;i++){
            	     this.dayLists[i].innerHTML="";
            	     this.dayLists[i].style.backgroundColor="";
            }
            var defaultDateEle=document.querySelector('.default-choosed');
            if(defaultDateEle&&defaultDateEle.classList.contains('default-choosed')){
              defaultDateEle.classList.remove('default-choosed');
            }
            var chooseDateEle=document.querySelector('.td-choosed');
            if(chooseDateEle&&chooseDateEle.classList.contains('td-choosed')){
              chooseDateEle.classList.remove('td-choosed');
            }            
     },
     /**
      * 设置选择日期范围时，开始时间与结束时间之间的单元格的背景色
      */
     clearDayInRangeStyle:function(){
          var dayInRangeEles=document.querySelectorAll('.day-in-range');
          for(var i=0,len=dayInRangeEles.length;i<len;i++){
                dayInRangeEles[i].classList.remove('day-in-range');
          }
     },
     /**
      * 设置显示默认的时间
      */
    setDefaultTime:function(){
              var dateArr=this.defaultDate.split('/');
              this.day.innerHTML=dateArr[2];
              this.month.innerHTML=dateArr[1];
              this.year.innerHTML=dateArr[0];
     },
     render:function(){
            this.clearBackGround();
            this.clearChoosedStyle();
            this.clearDayInRangeStyle();
            // 如果有默认的日期并且没有初始化日期
            // 判断选中的日期是否在当前的的日历内，在的话就添加各种样式
            var date=this.year.innerHTML+'/'+this.month.innerHTML;
            var tempFlag1=(parseInt(this.year.innerHTML)==parseInt(this.defaultDate.slice(0,4)))&&(parseInt(this.month.innerHTML)==parseInt(this.defaultDate.slice(5,7)));
            var tempFlag2=(parseInt(this.year.innerHTML)==parseInt(this.chooseDate[0]))&&(parseInt(this.month.innerHTML)==parseInt(this.chooseDate[1]));
            var tempFlag3=(parseInt(this.year.innerHTML)==parseInt(this.firstDate[0]))&&(parseInt(this.month.innerHTML)==parseInt(this.firstDate[1]));
            var tempFlag4=(parseInt(this.year.innerHTML)==parseInt(this.secondDate[0]))&&(parseInt(this.month.innerHTML)==parseInt(this.secondDate[1]));
            
            if(!this.hasChoosed&&tempFlag1){//如果没有一次也没点击（选中）其他日期
                  var dateArr=this.defaultDate.split('/');
                  var message=this.calculate.apply("",dateArr);
                  this.dayLists[message.whichDay+parseInt(message.day)-1].classList.add('default-choosed');
            }else{
                  var message=this.calculate(this.year.innerHTML,this.month.innerHTML,this.day.innerHTML);
            }
            
            if(!this.isSelectRange&&tempFlag2){
                 message=this.calculate.apply("",this.chooseDate);
                 this.dayLists[message.whichDay+parseInt(message.day)-1].classList.add('td-choosed');
            }
            if(this.isSelectRange){
                 if(tempFlag3){
                     message=this.calculate.apply("",this.firstDate);
                     this.dayLists[message.whichDay+parseInt(message.day)-1].classList.add('td-choosed');
                 }
                 if(tempFlag4){
                    message=this.calculate.apply("",this.secondDate);
                    this.dayLists[message.whichDay+parseInt(message.day)-1].classList.add('td-choosed');
                 }
            }
            // 设置选择日期范围，给处于开始和结束时间之内的日期添加样式
            var unSlectedDate;
            if(this.firstDate[0]!==0&&this.secondDate[0]!==0){
                var tempFlag=true;
            }else{
                var tempFlag=false;
            }
            for(var i=0,len=message.monthLen;i<len;i++){
                  this.dayLists[i+message.whichDay].innerHTML=i+1;
                  unSlectedDate=this.year.innerHTML+'/'+this.month.innerHTML+'/'+this.dayLists[i+message.whichDay].innerHTML;
                  if(tempFlag&&compareDate(unSlectedDate,this.firstDate.join('/'))&&compareDate(this.secondDate.join('/'),unSlectedDate)){
                       this.dayLists[i+message.whichDay].classList.add('day-in-range');
                  }
            }
     },
     /**
      * 设置选择时间段时，开始时间与结束时间的差是否在设置的跨度中
      * 是的话，返回true，否则返回false
      */
     chargeDiffDayinRange:function(){
         var diffDays=getDiffsDays(this.secondDate,this.firstDate);
         if(!(this.minRangeLen<=diffDays&&this.maxRangeLen>=diffDays)){
                     return false;
         }
         return true;
     },
     //返回选择的某一天日期
     getDayDate:function(){
          return this.chooseDate;
     },
     //返回选择的日期范围
     getRangeDate:function(){
          return this.firstDate+''+this.secondDate;
     }
}
/**
 * 比较date1和date2哪个日期大
 * @param  {string} date1 [description]
 * @param  {string} date2 [description]
 * @return {Boolean}    date1>date2,返回true，否则返回false
 */
function compareDate(date1,date2){
      // 此处如果没有设定选择范围，只能选择天数，则传入的startDate或者endDate 为null,就直接返回true
      if(date1===null||date2===null){
        return true;
      }
      var  t1=Date.parse(date1.split('/').join(','));
      var  t2=Date.parse(date2.split('/').join(','));
      return (t1>t2)?true:false;
}
/**
 * 找出两个日期之间中差了多少天
 * @param  {string} date1  日期
 * @param  {string} date2  日期
 * @return {number}     相差的天数
 */
function getDiffsDays(date1,date2){
   var d1 = new Date(date1);
   var d2 = new Date(date2);
   var timeDiff=Math.abs(d1.getTime()-d2.getTime());
   return (Math.ceil(timeDiff/(1000*3600*24)));
}

function doAction(self,ele){
       //设置选中单日时，被选中的dom对象，写成tableId+类名是为了防止页面中有多个对象时会冲突
      var selector1='#'+self.tableId+' '+'.td-choosed';
      var allHasChoosedEle=document.querySelectorAll(selector1);
      var len=allHasChoosedEle.length;
  
      //默认日期对应的dom对象
      var selector2='#'+self.tableId+' '+'.default-choosed';
      var defaultEle=document.querySelector(selector2);
      if(defaultEle){
            defaultEle.classList.remove('default-choosed');
      }
      if(self.isSelectRange){
             var date=[self.year.innerHTML,self.month.innerHTML,ele.innerHTML];            
             if(self.firstDate[0]===0){// 
                if(self.secondDate[0]===0){//两个日期都没有被设置
                     self.firstDate=date;
                }else{//firstDate没有被设置，secondDate已经被设置,
                     
                }
             }else{
                if(self.secondDate[0]===0){//firstDate已经设置，
                    self.secondDate=date;
                    if(compareDate(self.firstDate.join('/'),self.secondDate.join('/'))){//如果第一个选择的日期大于第二次选择的日期，进行交换
                        self.firstDate=[self.secondDate,self.secondDate=self.firstDate][0];
                    } 
                }else{//两个日期都已经被设置,已经选择了两个元素，再次选择则都
                   self.secondDate=[0,0,0];
                   self.firstDate=date;
                   self.clearDayInRangeStyle();
                }
             }
             self.day.innerHTML=ele.innerHTML;
             self.render();
      }else{
           self.day.innerHTML=ele.innerHTML;
           self.render();
           self.input.value=self.year.innerHTML+'/'+self.month.innerHTML+'/'+self.day.innerHTML;
           self.chooseDate=[self.year.innerHTML,self.month.innerHTML,self.day.innerHTML];
           if(len>0){
                  for(var i=0;i<len;i++){
                       allHasChoosedEle[i].classList.remove('td-choosed');
                   }
            }
           ele.classList.add('td-choosed');
    }
}
/**
 * 把日期转化为指定的日期格式并返回
 * @param  {string} format 指定的日期格式
 * @return {string}        返回日期
 */
Date.prototype.format =function(format){
      var o = {
            "M+" : this.getMonth()+1, //month"
            "d+" : this.getDate(), //day"
            "h+" : this.getHours(), //hour"
            "m+" : this.getMinutes(), //minute"
            "s+" : this.getSeconds(), //second"
            "q+" : Math.floor((this.getMonth()+3)/3), //quarter"
            "S" : this.getMilliseconds() //millisecond
        }
     if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
        (this.getFullYear()+"").substr(4- RegExp.$1.length));
        for(var k in o)
          if(new RegExp("("+ k +")").test(format))
            format = format.replace(RegExp.$1,RegExp.$1.length==1? o[k] :("00"+ o[k]).substr((""+ o[k]).length));
        return format;
}
window.Calendar=Calendar;
})(window,document);
/**
 * 日历组件实现效果要求：
 * 1. 有默认日期 √
 * 2. 可配置可选择日期的范围 √
 * 3. 有获取日期的接口，选择日期后的回调函数 
 * 4. 日期面板默认隐藏，点击输入框面板显示，再点击消失 √
 * 5. 点击面板上的日期后面板消失，输入框中显示选择的日期
 * 6. 增加一个参数及相应接口方法，来决定这个日历组件是选择具体某天日期，还是选择一个时间段
 * 7. 当选择时间段的时候，开始时间和结束时间之间的日期用特殊的样式标明
 * 8. 允许设置时间段选择的最小跨度和最大跨度，超出跨度回调函数处理
 * 9. 确认/取消按钮
 *
 * 拓展：
 * 1. 日期格式 dateformat :yy-mm-dd ,yy/mm/dd, dd-mm-yy
 * 2. 不能选择的日期或范围
 * 3. disable date 设置不能选择
 * 4. 日期显示框只能选择，避免用户输入错误的日期格式
 */
/**
 * todo:
 * 1. 样式修改 √
 * 2. render 函数重写，简化过程 √
 * 3. 
 * 4.  选择时间段的时候,给两个日期之间的天增加样式 √
 * 5. 怎么优雅的创建表格  √
 * 6. 当选择时间段的时候，选择了一个时间就点击ok，要有不同的提示 √
 * 7. 优化样式 √
 * 8. 日期格式 dateformat :yy-mm-dd ,yy/mm/dd, dd-mm-yy
 * 9. disable date 设置不能选择
 * 
 */