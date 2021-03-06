Meteor.startup(function(){
  import { Cookies } from 'meteor/ostrio:cookies';

  if(Meteor.isClient){
    cookies = new Cookies();

    Tinytest.add('From Server to Client', function(test){
      test.equal(cookies.get('FORCLIENT'), '_form_server_to_client_tests_');
    });

    Tinytest.add('cookies: set() / get()', function (test) {
      var testVal = 'this is test value';
      var setRes = cookies.set('testCookie', testVal);
      test.isTrue(setRes);
      test.equal(cookies.get('testCookie'), testVal);
    });

    Tinytest.add('cookies: set() / get() / has() FALSE', function (test) {
      var testVal = false;
      var setRes = cookies.set('testFalse', testVal);
      test.isTrue(setRes);
      test.isTrue(cookies.has('testFalse'));
      test.equal(cookies.get('testFalse'), testVal);
    });

    Tinytest.add('cookies: set() / get() / has() TRUE', function (test) {
      var testVal = true;
      var setRes = cookies.set('testTrue', testVal);
      test.isTrue(setRes);
      test.isTrue(cookies.has('testTrue'));
      test.equal(cookies.get('testTrue'), testVal);
    });

    Tinytest.add('cookies: set() / get() / has() NULL', function (test) {
      var testVal = null;
      var setRes = cookies.set('testNull', testVal);
      test.isTrue(setRes);
      test.isTrue(cookies.has('testNull'));
      test.equal(cookies.get('testNull'), testVal);
    });

    Tinytest.add('cookies: set() / get() Object', function (test) {
      var testVal = {key: '1', key2: {key1: 1, key2: false, key3: [true, false]}};
      var setRes = cookies.set('testObject', testVal);
      test.isTrue(setRes);
      test.equal(cookies.get('testObject'), testVal);
    });

    Tinytest.add('cookies: set() / get() Array', function (test) {
      var testVal = [true, false, null, {key1: 1, key2: false, key3: [true, false]}, [1,2,3,'4','5']];
      var setRes = cookies.set('testArray', testVal);
      test.isTrue(setRes);
      test.equal(cookies.get('testArray'), testVal);
    });

    Tinytest.add('cookies: set() / get() / has() no key', function (test) {
      test.isFalse(cookies.set());
      test.isNull(cookies.get());
      test.isFalse(cookies.has());
    });

    Tinytest.add('cookies: get() / has() from custom string', function (test) {
      var testVal = 'customCookieVal';
      var cookie = 'customCookie='+testVal+'; ';
      test.equal(cookies.get('customCookie', cookie), testVal);
      test.equal(cookies.get('asd', cookie), null);
      test.isTrue(cookies.has('customCookie', cookie));
      test.isFalse(cookies.has('asd', cookie));
    });


    Tinytest.add('cookies: remove() non existent cookie', function (test) {
      var removeRes = cookies.remove('1234567890asdfghjk');
      test.isFalse(removeRes);
    });


    Tinytest.add('cookies: keys() / has() / remove() some', function (test) {
      cookies.remove();

      var setResOne = cookies.set('testCookieOne', 'One');
      var setResTwo = cookies.set('testCookieTwo', 'Two');

      test.equal(cookies.keys(), ['testCookieOne', 'testCookieTwo']);

      test.isTrue(cookies.has('testCookieOne'));
      test.isTrue(cookies.has('testCookieTwo'));

      var removeRes = cookies.remove('testCookieOne');
      test.isTrue(removeRes);

      test.isFalse(cookies.has('testCookieOne'));
      test.isTrue(cookies.has('testCookieTwo'));
    });

    Tinytest.add('cookies: remove() all', function (test) {
      var removeRes = cookies.remove();
      test.isTrue(removeRes);
      test.equal(cookies.keys(), []);

      removeRes = cookies.remove();
      test.isFalse(removeRes);
    });

    Tinytest.add('Server test - see in console', function(test){});

    Tinytest.add('From Client to Server', function(test){
      cookies.set('FORSERVERTEST', '_form_client_to_server_tests_');
      cookies.send()
    });

    Tinytest.addAsync('cookies: send(callback)', function (test, next) {
      cookies.send(function () {
        test.isTrue(true);
        next();
      })
    });

  }else{

    var tester = function(one, two, testname){
      if(EJSON.equals(one, two)){
        console.info('['+testname+'] PASSED');
      }else{
        console.warn('['+testname+'] Failed', 'Expected: ' + JSON.stringify(two), "Got: " + JSON.stringify(one));
      }
    };

    cookie = new Cookies({
      auto: false, 
      handler: function(cookies){
        tester(cookies.get('FORSERVERTEST'), '_form_client_to_server_tests_', 'From Client to Server [First Time should FAIL]');

        (function(){
          var testVal = 'this is test value';
          var setRes = cookies.set('testCookie', testVal);
          tester(setRes, true, 'cookies.set', cookies);
          tester(cookies.get('testCookie'), testVal, 'cookies.get', cookies);
        })();

        (function(){
          tester(cookies.set(), false, 'cookies.set()', cookies);
          tester(cookies.get(), null, 'cookies.get()', cookies);
          tester(cookies.has(), false, 'cookies.has()', cookies);
        })();

        (function(){
          var testVal = 'customCookieVal';
          var cookie = 'customCookie='+testVal+'; ';
          tester(cookies.get('customCookie', cookie), testVal, "cookies.get('customCookie')", cookies);
          tester(cookies.get('asd', cookie), null, "cookies.get('asd')", cookies);
          tester(cookies.has('customCookie', cookie), true, "cookies.has('customCookie')", cookies);
          tester(cookies.has('asd', cookie), false, "cookies.has('asd')", cookies);
        })();


        (function(){
          var removeRes = cookies.remove('1234567890asdfghjk');
          tester(removeRes, false, "cookies.remove('1234567890asdfghjk')", cookies);
        })();


        (function(){
          cookies.remove();

          var setResOne = cookies.set('testCookieOne', 'One');
          var setResTwo = cookies.set('testCookieTwo', 'Two');

          tester(cookies.keys(), ['testCookieOne', 'testCookieTwo'], "cookies.keys()", cookies);

          tester(cookies.has('testCookieOne'), true, "cookies.has('testCookieOne')", cookies);
          tester(cookies.has('testCookieTwo'), true, "cookies.has('testCookieTwo')", cookies);

          var removeRes = cookies.remove('testCookieOne');
          tester(removeRes, true, "cookies.remove('testCookieOne')", cookies);

          tester(cookies.has('testCookieOne'), false, "cookies.has('testCookieOne')", cookies);
          tester(cookies.has('testCookieTwo'), true, "cookies.has('testCookieTwo')", cookies);
        })();

        (function(){
          var removeRes = cookies.remove();
          tester(removeRes, true, "cookies.remove()", cookies);
          tester(cookies.keys(), [], "cookies.keys()", cookies);

          removeRes = cookies.remove();
          tester(removeRes, false, "cookies.remove()", cookies);
        })();

        cookies.set('FORCLIENT' , '_form_server_to_client_tests_');
      }
    });

    WebApp.connectHandlers.use(cookie.middleware());
  }
});