import JWT from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const {token} = req.cookies;

    if(!token){
        return res.json({success: false, message: "Not Authorized. Login Again"})
    }

    try{
        const tokenDecode = JWT.verify(token, process.env.JWT_SECRET);

        if(tokenDecode.id){
            req.userId = tokenDecode.id;
            req.body.userId = tokenDecode.id;
        } else {
            return res.json({success: false, message: "Not Authorized. Login Again"})
        }

        next();

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export default userAuth;
