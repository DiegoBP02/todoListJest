import Task from "../Models/Task.js";
import checkPermissions from "../utils/checkPermissions.js";

const createTask = async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ msg: "Please provide all values!" });
  }

  req.body.createdBy = req.user.userId;
  const taskCreated = await Task.create(req.body);
  res.status(201).json(taskCreated);
};

const getAllTasks = async (req, res) => {
  let result = Task.find({ createdBy: req.user.userId });

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const tasks = await result;

  const totalTasks = await Task.countDocuments({ createdBy: req.user.userId });
  const numOfPages = Math.ceil(totalTasks / limit);

  res.status(200).json({ tasks, totalTasks, numOfPages });
};

const updateTask = async (req, res) => {
  const { id: taskId } = req.params;
  const { task, urgency, completed } = req.body;

  if (!task || !urgency || !completed) {
    return res.status(400).json({ msg: "Please provide all values!" });
  }

  const taskUpdate = await Task.findOne({ _id: taskId });
  if (!taskUpdate) {
    return res.status(404).json({ msg: `No task with id: ${taskId}!` });
  }

  checkPermissions(req.user, taskUpdate.createdBy);

  const updatedTask = await Task.findOneAndUpdate({ _id: taskId }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(updatedTask);
};

const deleteTask = async (req, res) => {
  const { id: taskId } = req.params;

  const task = await Task.findOne({ _id: taskId });

  if (!task) {
    return res.status(404).json({ msg: `No task with id: ${taskId}!` });
  }

  checkPermissions(req.user, task.createdBy);

  await task.remove();

  res.status(200).json({ msg: "Success! Task removed!" });
};

export { createTask, deleteTask, getAllTasks, updateTask };
