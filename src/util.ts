import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Role from "./models/Role";
import Level from "./models/Level";

export const createToken = (user: any) => {
    // Sign the JWT
    if (!user.role) {
      throw new Error('No user role specified');
    }
    return jwt.sign(
      {
        sub: user._id,
        email: user.email,
        role: user.role,
        level: user.level,
        iss: 'api.orbit',
        aud: 'api.orbit'
      },
      process.env.JWT_SECRET as string,
      { algorithm: 'HS256', expiresIn: '1h' }
    );
};

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, receivedPassword: string) => {
    return await bcrypt.compare(password, receivedPassword)
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const role = await Role.findById((<any>req).user!.role!);
		if (role.name === "admin") {
			next();
			return;
		}
		return res.status(401).json({ message: 'Insufficient role'});
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: error });
	}
};

export const requireSenior = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const level = await Level.findById((<any>req).user!.level!);
		if (level.name === "senior") {
			next();
			return;
		}
		return res.status(401).json({ message: 'Insufficient level'});
	} catch (error) {
		console.log(error)
		return res.status(500).send({ message: error });
	}
};
