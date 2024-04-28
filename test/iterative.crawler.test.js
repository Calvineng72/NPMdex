global.nodeConfig = {ip: '127.0.0.1', port: 3000};
const distribution = require('../distribution');
const id = distribution.util.id;

const crawlerGroup = {};

/*
   This hack is necessary since we can not
   gracefully stop the local listening node.
   The process that node is
   running in is the actual jest process
*/

let localServer = null;

/*
    The local node will be the orchestrator.
*/

const n1 = {ip: '127.0.0.1', port: 3001};
const n2 = {ip: '127.0.0.1', port: 3002};
const n3 = {ip: '127.0.0.1', port: 3003};

beforeAll((done) => {
  /* Stop the nodes if they are running */

  crawlerGroup[id.getSID(n1)] = n1;
  crawlerGroup[id.getSID(n2)] = n2;
  crawlerGroup[id.getSID(n3)] = n3;

  const startNodes = (cb) => {
    distribution.local.status.spawn(n1, (_e, _v) => {
      distribution.local.status.spawn(n2, (_e, _v) => {
        distribution.local.status.spawn(n3, (_e, _v) => {
          cb();
        });
      });
    });
  };

  distribution.node.start((server) => {
    localServer = server;

    startNodes(() => {
      distribution.all.groups.put({gid: 'all'}, crawlerGroup, (_e, _v) => {
        done();
      });
    });
  });
});

afterAll((done) => {
  let remote = {service: 'status', method: 'stop'};
  remote.node = n1;
  distribution.local.comm.send([], remote, (_e, _v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (_e, _v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (_e, _v) => {
        localServer.close();
        done();
      });
    });
  });
});

// function sanityCheck(mapper, reducer, dataset, expected, done) {
//   let mapped = dataset.map((o) =>
//     mapper(Object.keys(o)[0], o[Object.keys(o)[0]]));

//   /* Flatten the array. */
//   mapped = mapped.flat();
//   let shuffled = mapped.reduce((a, b) => {
//     let key = Object.keys(b)[0];
//     if (a[key] === undefined) a[key] = [];
//     a[key].push(b[key]);
//     return a;
//   }, {});
//   let reduced = Object.keys(shuffled).map((k) => reducer(k, shuffled[k]));
//   reduced = reduced.flat();

//   try {
//     expect(reduced).toEqual(expect.arrayContaining(expected));
//   } catch (e) {
//     done(e);
//   }
// }


// ----------------------------------------------------- //

const crawler = require('../distribution/subsystems/crawlingSubsystem');
const crawlerMap = crawler.map;
const crawlerReduce = crawler.reduce;

// test('(0 pts) crawler subsystem (example)', (done) => {
//   let m = crawlerMap;
//   let r = crawlerReduce;

//   let dataset = [
//     {'https://www.example.com/': 'https://www.example.com/'},
//   ];

//   let expected = [{'https://www.iana.org/domains/example': ['https://www.example.com/']}];

//   /* Sanity check: map and reduce locally */
//   // sanityCheck(m, r, dataset, expected, done);

//   /* Now we do the same thing but on the cluster */
//   let keys = dataset.map((o) => id.getID(Object.keys(o)[0]));
//   const doMapReduce = (_cb) => {
//     distribution.all.mr.exec(
//         {keys: keys, map: m, reduce: r, rounds: 1},
//         (_e, v) => {
//           try {
//             console.log('THESE ARE THE RESULTS', v)
//             expect(v).toEqual(expect.arrayContaining(expected));
//             done();
//           } catch (e) {
//             done(e);
//           }
//         });
//   };

//   let cntr = 0;

//   // We send the dataset to the cluster
//   dataset.forEach((o) => {
//     let key = id.getID(Object.keys(o)[0]);
//     let value = o;
//     distribution.all.store.put(value, key, (_e, _v) => {
//       cntr++;
//       // Once we are done, run the map reduce
//       if (cntr === dataset.length) {
//         doMapReduce();
//       }
//     });
//   });
// });


test('(0 pts) crawler subsystem (gutenberg)', (done) => {
  let m = crawlerMap;
  let r = crawlerReduce;

  let dataset = [
    {'https://www.npmjs.com/search?q=text':
      'https://www.npmjs.com/search?q=text'},
  ];

  let expected = [{'https://www.gutenberg.org/ebooks/73436':
    ['https://www.gutenberg.org/']}];

  /* Sanity check: map and reduce locally */
  // sanityCheck(m, r, dataset, expected, done);

  /* Now we do the same thing but on the cluster */
  let keys = dataset.map((o) => id.getID(Object.keys(o)[0]));
  const doMapReduce = (_cb) => {
    distribution.all.mr.exec(
        {keys: keys, map: m, reduce: r, rounds: 1},
        (_e, v) => {
          try {
            done();
          } catch (e) {
            done(e);
          }
        });
  };

  let cntr = 0;

  // We send the dataset to the cluster
  dataset.forEach((o) => {
    let key = id.getID(Object.keys(o)[0]);
    let value = o;
    distribution.all.store.put(value, key, (_e, _v) => {
      cntr++;
      // Once we are done, run the map reduce
      if (cntr === dataset.length) {
        doMapReduce();
      }
    });
  });
}, 10000000);
