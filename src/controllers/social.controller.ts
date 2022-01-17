/**
 * Handle all your social auth routesß
 *
 */

 class Social {
	public static googleCallback(req, res, next): any {
        console.log("in google call back", req.isAuthenticated())
        next();
		return res.status(200).json({msg:"Successfully login"});
	}
}

export default Social;
