
---
#datepicker 日期选择组件，无依赖，纯原生
-------------
（逃，其实是没用过框架
> 关于我，欢迎关注  
  博客：[浴火小青春](https://segmentfault.com/u/wcy) 
  一个稚嫩的程序猿~~~

####示例:  
上图：
![选择时间段][1]
![默认的某一天][2]
![选择某一天][3]
![选择时间段，跨了月份][4]
![选择时间段，跨了月份][5]
![选择时间段，跨了月份][6]
<br>
界面大致效果是这样，回调的例子写的控制台打印就没截图下来，
使用的时候可以修改你的'''calendar.css'''文件，样式都可以在里面修改

###原理说明
设计思路的话等我的博文吧，打算写篇博客~~~

### 下载安装
在html文件中添加以下代码
``` html
<input type="text" id='ipt' readonly>
    <div id="calendar">
                  <p class="month-year-change">
                  <span class="day"></span>号
                  <i class="fa fa-angle-double-left del-year" aria-hidden="true"></i>
                  <i class="fa fa-angle-left del-month" aria-hidden="true"></i>
                  <span class="month">4</span>月
                  <span class="year">2016</span>年
                  <i class="fa fa-angle-right add-month" aria-hidden="true"></i>
                  <i class="fa fa-angle-double-right add-year" aria-hidden="true"></i>
                  </p>
    	<div>
    	     <table class="day-list" id='myTable'>
    	     </table>
           <button type="button" class="ok-btn">ok</button>
           <button type="button"  class="cancel-btn">cancel</button>
    	</div>
    </div>

<script src="calendar.js"></script>
```

###使用方法
有很多配置项，下面我一一介绍给大家~
```javascript
var a=new Calendar({
                  id:"calendar", //容器id
                  inputId:"ipt",//文本框id
                  tableId:'myTable',//table的id
                  dayHeadFormat:['Sun','Mon','Tues','Wens','Thurs','Fri','Sat'],//日期头的格式，也可以填写[日，一，二，三，四，五，六]等
                  tableClassName:'day-list',//table的类名，若有多个类，以空格分开
                  defaultDate:'2016/06/20',//默认的日期
                  isLimitedRange:true,//是否限定可以选择的日期
                  startDate:'2015/6/21',// 可选择日期范围的开端
                  endDate:'2017/6/25',//可选择日期范围的结束
                  isSelectRange:false,//选择日期范围还是选择某一天
                  minRangeLen:3,//最短的时间跨度
                  maxRangeLen:50,//最长的时间跨度
                  onSelected:function(){//选择日期后的回调函数
                    /**
                     * 如果是选择日期，则可以通过this.getRangeDate()获取选择的时间段
                     * 如果是选择某一天，则可以通过this.getDayDate()获取选择的时间
                     */
                    console.log(this.getRangeDate());//this.getDayDate()
          });
```

###TODO（可选）
- 设置不可以选的时间段和时间点
- 设置显示的时间格式

## 备注
欢迎大家找bug,提问题啊


  [1]: http://i4.buimg.com/0266068712fd2d50.png
  [2]: http://i4.buimg.com/ddbcea314e544973.png
  [3]: http://i4.buimg.com/d8e272018e5039be.png
  [4]: http://i4.buimg.com/e3550aae660c6727.png
  [5]: http://i4.buimg.com/cdd2286306052cac.png
  [6]: http://i4.buimg.com/3d9e04be57d37239.png
