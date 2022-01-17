/**
 * Handle all your social auth routesß
 *
 */

 class Social {
	public static googleCallback(req, res): any {
        console.log("in google call back", req.isAuthenticated())
		return res.redirect('/');
	}
}

export default Social;
