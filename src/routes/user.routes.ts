import { Router, Request, Response, NextFunction } from "express";
import User from "../models/User";
import Role from "../models/Role";
import Level from "../models/Level";
import jwtDecode from "jwt-decode";
import jwt from "express-jwt";
import { createToken, hashPassword, verifyPassword, requireAdmin, requireSenior } from "../util";
const router: Router = Router();

interface UserData {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: string,
    level: string
}

interface UserInfo {
	firstName: string,
    lastName: string,
    email: string,
	role: string,
    level: string
}

router.post('/authenticate', async (req: Request, res: Response) => {
    try {
		const { email, password } = req.body;
	
		const user = await User.findOne({ email }).lean();
		
		// check if the user exist or not
		if (!user) {
			return res.status(403).json({ message: 'Wrong email or password.' });
		}
		
		const passwordValid: Boolean = await verifyPassword(password, user.password);

		if (passwordValid) {
			const { firstName, lastName, email, role, level } = user;
			const userInfo: UserInfo = {
				firstName,
				lastName,
				email,
				role,
				level
			};
			
			const token = createToken(userInfo);
	
			const decodedToken: any = jwtDecode(token);
			const expiresAt = decodedToken.exp;
	
			res.json({
				message: 'Authentication successful!',
				token,
				userInfo,
				expiresAt
			});
		} else {
			res.status(403).json({ message: 'Wrong email or password.' });
		}
    } catch (err) {
		console.log(err);
		return res.status(400).json({ message: 'Something went wrong.' });
    }
});

router.post('/signup', async (req: Request, res: Response) => {
	try {
		const { firstName, lastName, email, role, level } = req.body;
	
		const hashedPassword = await hashPassword( req.body.password);

		let foundRole: any, foundLevel: any;
		
		if (role) {
		 	foundRole = await Role.findOne({ name: role });
		} else {
			foundRole = await Role.findOne({ name: "user" });
		}

		if (level) {
			foundLevel = await Level.findOne({ name: level });
		} else {
			foundLevel = await Level.findOne({ name: "junior" });
		}

		const userData: UserData = {
			firstName,
			lastName,
			email: email.toLowerCase(),
			password: hashedPassword,
			role: foundRole.id,
			level: foundLevel.id
		};
	
		const existingEmail = await User.findOne({ email: userData.email }).lean();
	
		if (existingEmail) {
			return res.status(400).json({ message: 'Email already exists.' });
		}
	
		const newUser = new User(userData);
		const savedUser = await newUser.save();
	
		if (savedUser) {
			const token = createToken(savedUser);
			const decodedToken: any = jwtDecode(token);
			const expiresAt = decodedToken.exp;
	
			const { firstName, lastName, email, role, level } = savedUser;
	
			const userInfo: UserInfo = {
				firstName,
				lastName,
				email,
				role,
				level
			};
	
			return res.json({
				message: 'User created!',
				token,
				userInfo,
				expiresAt
			});
		} else {
			return res.status(400).json({
				message: 'There was a problem creating your account.'
			});
		}
	} catch (err) {
	  return res.status(400).json({
		message: 'There was a problem creating your account.'
	  });
	}
});

const attachUser = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization;
	if (!token) {
	return res
		.status(401)
		.json({ message: 'Authentication invalid' });
	}
	const decodedToken = jwtDecode(token.slice(7));

	if (!decodedToken) {
	return res.status(401).json({
		message: 'There was a problem authorizing the request'
	});

	} else {
		req.user = decodedToken as Express.User;
		next();
	}
};

router.use(attachUser);

const requireAuth = jwt({
	secret: process.env.JWT_SECRET as string,
	algorithms: ['HS256'],
	audience: 'api.orbit',
	issuer: 'api.orbit',
});

router.get('/dashboard', [requireAuth, requireAdmin, requireSenior], (req: Request, res: Response ) => {
	res.json({ message: "Dashboard page" });
	console.log(req.user);
});

export default router;