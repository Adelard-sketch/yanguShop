const authService = require('../services/auth.service');

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) { next(err); }
};

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    // result contains message about verification
    res.status(201).json(result);
  } catch (err) { next(err); }
};

exports.verify = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body);
    res.json(result);
  } catch (err) { next(err); }
};

exports.verifyLogin = async (req, res, next) => {
  try {
    const result = await authService.verifyLogin(req.body);
    res.json(result);
  } catch (err) { next(err); }
};

exports.resend = async (req, res, next) => {
  try {
    const result = await authService.resendVerification(req.body);
    res.json(result);
  } catch (err) { next(err); }
};

exports.forgot = async (req, res, next) => {
  try {
    const result = await authService.requestPasswordReset(req.body);
    res.json(result);
  } catch (err) { next(err); }
};

exports.reset = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (err) { next(err); }
};
