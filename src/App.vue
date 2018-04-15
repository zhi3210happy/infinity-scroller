<template>
        <div id="app">
        <ul id="infinite-scroll" v-stream:scroll="plus$">
          <li v-for="(item,i) in list" :key="i">
            {{`${item.id}-${item.title}`}}
          </li>
        </ul>
        <child></child>
      </div>
</template>

<script>
Function.prototype.getName = function(){
    return this.name || this.toString().match(/function\s*([^(]*)\(/)[1]
}
const functional=(sup)=>function(com,...args){
  if(!sup){
    console.error(`[Functional warn] ${sup} is not valid`)
    return
  }
  if(!com||com&&typeof com!=='function'){
    console.error(`[Functional warn] ${com} is not valid ,props must be a function`)
    return sup
  }
  if(!sup.components){
    sup.components={}
  }
  Array.from(arguments).forEach((item,i)=>{
    sup.components[item.getName()]={
      name:item.getName(),
      functional:true,
      render:item
    }
  })
  return sup    
}
const child=(h,props)=><div>我是函数式组件</div>
import Rx from 'rxjs'

const App= {
  domStreams: ['plus$'],
  subscriptions() {
    return{
      requestOnScroll$:this.plus$.pluck('event','target').
      map(({scrollHeight,scrollTop,clientHeight}) =>(
        {
        sH:scrollHeight,
        sT:scrollTop,
        cH:clientHeight
      }))
      .pairwise()
      .filter(positions => {
        return (
          this.isUserScrollingDown(positions) &&
          this.isScrollExpectedPercent(positions[1], 80)
        )
      }).startWith([])
      .exhaustMap(() => Rx.Observable.fromPromise(this.getQuotesAPI()))
    }
  },
  data() {
    return {
      list: [],
      currentPage: 1
    };
  },
  methods: {
    getQuotesAPI() {
      this.currentPage++;
      return fetch(
        `https://node-hnapi.herokuapp.com/news?page=${this.currentPage}`
      );
    },
    isUserScrollingDown(positions) {
      return positions[0].sT < positions[1].sT;
    },
    isScrollExpectedPercent(position, percent) {
      return (position.sT + position.cH) / position.sH > percent / 100;
    },
    processData(res) {
      res.json().then(news => {
        this.list = this.list.concat(news);
      });
    }
  },
  mounted() {
   this.$observables.requestOnScroll$.subscribe(this.processData)
  },
  beforeDestroy() {},
  // render(){
  //   return(
  //     <div id="app">
  //       <ul id="infinite-scroll">
  //         {this.list.map(news => {
  //           return <li>{`${news.id} - ${news.title}`}</li>;
  //         })}
  //       </ul>
  //     </div>
  //   )
  // }
};
export default functional(App)(child)
</script>

<style lang="scss">
#infinite-scroll {
  height: 500px;
  width: 700px;
  border: 1px solid #f5ad7c;
  overflow: scroll;
  padding: 0;
  li {
    padding: 10px 5px;
    line-height: 1.5;
    &:nth-child(odd) {
      background: #ffe8d8;
    }
    &:nth-child(even) {
      background: #f5ad7c;
    }
  }
}
</style>
