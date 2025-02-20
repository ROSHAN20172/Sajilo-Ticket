import Operator from '../../models/operator/operatorModel.js';

export const getOperatorData = async (req, res) => {
  try {
    const operator = await Operator.findById(req.operator.id).select('-password');
    if (!operator) {
      return res.status(404).json({ success: false, message: 'Operator not found' });
    }

    res.status(200).json({
      success: true,
      operatorData: {
        name: operator.name,
        isAccountVerified: operator.isAccountVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Try again later.' });
  }
};
