import { Router } from 'express';

var passport = require('passport');
app.passport = passport;

var LocalStrategy = require('passport-local').Strategy;

const routes = Router();

var Auth0Strategy = require('passport-auth0');

// Configure Passport to use Auth0
const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_SECRET, 
    callbackURL: process.env.AUTH0_CALLBACK_URL
  },
  (accessToken, refreshToken, extraParams, profile, done) => {
    return done(null, profile);
  }
);

passport.use(strategy);

// This can be used to keep a smaller payload
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// ...
app.use(passport.initialize());
app.use(passport.session());


// Perform the login
routes.get(
  '/login',
  (req,res,next)=>{
  	req.session.returnTo = req.query.return;
  	next();
  },
  passport.authenticate('auth0', {
    clientID: process.env.AUTH0_CLIENT_ID,
    domain: process.env.AUTH0_DOMAIN,
    redirectUri: process.env.AUTH0_CALLBACK_URL,
    // audience: 'https://' + env.AUTH0_DOMAIN + '/userinfo', // unnecessary? 
    responseType: 'code',
    scope: 'openid profile email'
  }),
  function(req, res) {
  	// on failure? 
    res.redirect('/');
  }
);

// Perform session logout and redirect to homepage
routes.get('/logout', (req, res) => {
	req.session.user = null;
  req.logout();
  res.redirect(process.env.AUTH0_LOGOUT_REDIRECT);
});

// Perform the final stage of authentication and redirect to '/user'
routes.get(
  '/callback',
  passport.authenticate('auth0', {
    failureRedirect: '/'
  }),
  async function(req, res) {
  	console.log('Got User:', req.user);

		// fetch local user, or create them 
		console.log('---FETCHUSER1---');
		let user = await fetchUser({
			auth0id: req.user.id
		});

		// console.log('Fetched User:', user);
		// res.redirect(req.session.returnTo || '/');

		if(!user){
			// create user 
			console.log('---CREATING A USER---');
			// return false;
			await createUser(req.user.id, req.user.displayName, req.user.nickname);
			await (()=>{
				return new Promise((resolve,reject)=>{
					setTimeout(()=>{
						resolve();
					},2000);
				})
			})()
			user = await fetchUser({
				auth0id: req.user.id
			});
			if(!user){
				// failed finding user, even after we just created them!  
				console.error('USER failed');
				res.redirect('/?failed-login');
				return;
			}
		}

		console.log('---SESSION USER SET1---');

  	req.session.user = user; // req.user; // update session user 
    res.redirect(req.session.returnTo || '/user');
  }
);




// // "me" can be got from graphql viewer.me
// // routes.get('/me', (req, res) => {
// //   res.send({
// //     user: req.session ? req.session.user : null
// //   })
// // });

// // session.


// passport.use(new LocalStrategy({
// 	// usernameField: 'username',
//  //  passwordField: 'password',
//   passReqToCallback: true
// },
//   function(req, username, password, cb) {
//   	console.debug('fetchUser in passport.user new LocalStrategy', username, password);
//   	fetchUser({
//   		email: username,
//   		password: password
//   	})
//   	.then(user=>{
//   		console.log("FAILED HERE");
//   		cb(null, {
//   			user
//   		});
//   	})
//   	.catch(err=>{
//   		console.debug('FetchUser err:', err);
//   		return cb(err || 'Failed Finding User');
//   	})
//     // db.users.findByUsername(username, function(err, user) {
//     //   if (err) { return cb(err); }
//     //   if (!user) { return cb(null, false); }
//     //   if (user.password != password) { return cb(null, false); }
//     //   return cb(null, user);
//     // });
//   }));


// routes.post('/login',(req,res,next)=>{
// 		// should keep attached
// 		req.session.redirectAfterLogin = req.body.redirect;
// 		next();
// 	},
//   passport.authenticate('local', { failureRedirect: '/failedlogin' }),
//   function(req, res) {
//   	console.debug('Redirecting after LOGIN!', req.user);
//   	req.session.user = req.user.user;
//   	let redirectAfterLogin = req.session.redirectAfterLogin;

//   	if(redirectAfterLogin){
//     	redirectAfterLogin = `${redirectAfterLogin}?uid=${req.session.user._id}&email=${req.session.user.email}`; // auth protects the user profile, pretending here! (todo) 
//     }

//     res.send({
//     	redirect: redirectAfterLogin || '/?unknow+where+to+redirect'
//     });

//     req.session.redirectAfterLogin = null;
//   });
  

// routes.get('/roles/:email?/:role?',(req, res)=>{

// 	// console.log('EMAIL:', req.params.email);

// 	let roles = ['admin','role2'];

// 	let newRoles = req.params.role;

// 	req.session.what = 'test';

// 	if(!req.session.user){
// 		return res.send(req.session);
// 	}

// 	if(req.session.user.roles.indexOf('admin') === -1){
// 		// return res.send('Not an admin, cannot change roles');
// 	}

// 	let email = req.params.email;

// 	if(!email){
// 		return res.send('roles: ' + JSON.stringify(roles));
// 	}

// 	// Update user
// 	fetchUser({
// 		email: email
// 	})
// 	.then(user=>{
// 		// cb(null, user);

// 		if(newRoles && newRoles.length){

// 			newRoles = newRoles.split(',');

// 			let currentRoles = user.roles || [];

// 			newRoles.forEach(role=>{
// 				if(roles.indexOf(role) > -1){
// 					let pos = currentRoles.indexOf(role);
// 					if(pos > -1){
// 						currentRoles.splice(pos,1);
// 					} else {
// 						currentRoles.push(role);
// 					}
// 				}
// 			})

// 			user.roles = currentRoles;

// 			// // Update user's roles
// 			// return res.send({
// 			// 	user: user
// 			// });

// 			// Update user
// 			updateUserRoles(user)
// 			.then(user=>{
// 				res.send({
// 					user: user
// 				});
// 			})
// 			.catch(err=>{
// 				res.send('Failed:' + err);
// 			})


// 		} else {
// 			return res.send({
// 				user: user
// 			});
// 		}


// 	})
// 	.catch(err=>{
// 		res.send('Failed:' + err);
// 	})

// 	// res.send('ok');
// });

// routes.get('/logout',
//   function(req, res){
//     req.logout();
//     req.session.destroy();
//     res.redirect('/');
//   });

// // app.get('/profile',
// //   require('connect-ensure-login').ensureLoggedIn(),
// //   function(req, res){
// //     res.render('profile', { user: req.user });
// //   });


// passport.serializeUser(function(account, cb) {
// 	console.debug('serializeUser: account:', account);
//   cb(null, JSON.stringify(account));
// });

// passport.deserializeUser(function(tmpAccount, cb) {
//   // console.debug('fetchUser deserializeUser', tmpAccount);
//   let account = JSON.parse(tmpAccount);
//   if(!account|| !account.user){
//   	console.debug('Returning empty deserializeUser');
//   	return cb(null);
//   }
// 	fetchUser({
// 		_id: account.user._id,
// 	})
// 	.then(user=>{
// 		cb(null, user);
// 	})
// 	.catch(err=>{
// 		console.log('Failed deserializing!');
// 		// return cb(err);
// 		cb(null,null);
// 	})
// });



function createUser(auth0id, email, username){
	return new Promise(async (resolve, reject)=>{

		const schema = await app.graphql.getAdminSchema();

	  let mutate_User = `
	    mutation (
	    	$record: CreateOneUsersInput!
	    ) {
        user {
          create(record: $record) {
            record {
            	_id
	            auth0id
	            createdAt
	          }
          }
        }
	    }
	  `

	  let tmpRecord = {
	  	email,
	  	username,
	  	auth0id,
	  	active: true,
	  	createdAt: (new Date()).getTime()
	  };

	  let result = await app.graphql.graphql({
	    schema: schema,
	    source: mutate_User,
	    context: {
	    	admin: true,
				schema: schema,
				user: null
			},
	    variableValues: {
	    	record: tmpRecord
	    }
	  })

	  console.log('CreateUser Result:', JSON.stringify(result,null,2));

	  if(result.data && result.data.user && result.data.user.create){
	  	resolve(result.data.user.create.record);
	  } else {
	  	console.error('Failed fetchUser in auth!', JSON.stringify(result,null,2));
	  	reject(result);
	  }


	})
}

const fetchUser = (filterOpts) => {

	return new Promise(async (resolve, reject) => {

		console.log('--FetchUser FIlter Opts--', filterOpts);

		const schema = await app.graphql.getAdminSchema();

	  let query_User = `
	    query (
	    	$filter: FilterFindOneUsersInput
	    ) {
	      viewer {
	        user {
	          one(filter: $filter) {
	            _id
	            auth0id
	            createdAt
	          }
	        }
	      }
	    }
	  `

	  let result = await app.graphql.graphql({
	    schema: schema,
	    source: query_User,
	    context: {
	    	admin: true,
				schema: schema,
				user: null
			},
	    variableValues: {
	    	filter: filterOpts
	    }
	  })

	  if(result.data && result.data.viewer){
	  	resolve(result.data.viewer.user.one);
	  } else {
	  	console.error('Failed fetchUser in auth1!', JSON.stringify(result,null,2));
	  	reject(result);
	  }

	})

}

// const updateUserRoles = (record) => {

// 	return new Promise(async (resolve, reject) => {

// 		const schema = await app.graphql.getAdminSchema();

// 	  let mutate_User = `
// 	    mutation (
// 	    	$record: UpdateByIdUsersInput!
// 	    ) {
//         user {
//           updateById(record: $record) {
//             record {
//             	_id
// 	            email
// 	            createdAt
// 	          }
//           }
//         }
// 	    }
// 	  `

// 	  let tmpRecord = {};
// 	  tmpRecord._id = record._id;
// 	  // tmpRecord.roles = record.roles;

// 	  let result = await app.graphql.graphql({
// 	    schema: schema,
// 	    source: mutate_User,
// 	    context: {
// 	    	admin: true,
// 				schema: schema,
// 				user: null
// 			},
// 	    variableValues: {
// 	    	record: tmpRecord
// 	    }
// 	  })

// 	  console.log('UPDATED userRoles:', JSON.stringify(result,null,2));

// 	  if(result.data && result.data.user && result.data.user.updateById){
// 	  	resolve(result.data.user.updateById.record);
// 	  } else {
// 	  	console.error('Failed fetchUser in auth2!', JSON.stringify(result,null,2));
// 	  	reject(result);
// 	  }

// 	})

// }


export default routes;
