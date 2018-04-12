<template>
        <div id="app">
        <ul id="infinite-scroller" v-stream:scroll="plus$">
          <li v-for="(item,i) in list" :key="i">
            {{`${item.id}-${item.title}`}}
          </li>
        </ul>
      </div>
</template>

<script>
import Rx from 'rxjs'
export default {
  domStreams: ['plus$'],
  subscriptions() {
    return{
      requestOnScroll$:this.plus$.map(({event}) =>(
        {
        sH: event.target.scrollHeight,
        sT: event.target.scrollTop,
        cH: event.target.clientHeight
      }))
      .pairwise()
      .filter(positions => {
        return (
          this.isUserScrollingDown(positions) &&
          this.isScrollExpectedPercent(positions[1], 90)
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
  //       <ul id="infinite-scroller">
  //         {this.list.map(news => {
  //           return <li>{`${news.id} - ${news.title}`}</li>;
  //         })}
  //       </ul>
  //     </div>
  //   )
  // }
};
</script>
<style lang="scss">
#infinite-scroller {
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
