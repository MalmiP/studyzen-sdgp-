"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  Flag,
  Plus,
  Target,
  Trash2,
  Trophy,
  ArrowRight,
  CalendarPlus2Icon as CalendarIcon2,
  CheckCircle,
  X,
  CheckSquare,
  ListTodo,
} from "lucide-react";

const ProgressPage = () => {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    deadline: new Date(),
    completed: false,
    targets: [],
  });
  const [newTarget, setNewTarget] = useState("");
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);

  // Fetch goals from the backend
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/progress");
        const data = await res.json();
        setGoals(data);
        if (data.length > 0) {
          setSelectedGoal(data[0]._id);
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchGoals();
  }, []);

  const currentGoal = goals.find((goal) => goal._id === selectedGoal) || goals[0];

  const calculateProgress = (goal) => {
    if (goal.completed) return 100;
    if (!goal.targets || goal.targets.length === 0) return 0;
    const completedTargets = goal.targets.filter((target) => target.completed).length;
    return Math.round((completedTargets / goal.targets.length) * 100);
  };

  // Create a new goal (allow empty fields)
  const handleAddGoal = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });
      const createdGoal = await res.json();
      setGoals((prev) => [...prev, createdGoal]);
      setNewGoal({
        title: "",
        description: "",
        deadline: new Date(),
        completed: false,
        targets: [],
      });
      setIsAddGoalOpen(false);
      setSelectedGoal(createdGoal._id);
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  // Add a target to the current goal
  const handleAddTarget = async () => {
    if (!selectedGoal) return;
    try {
      const res = await fetch(`http://localhost:3001/api/progress/${selectedGoal}/targets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTarget, completed: false }),
      });
      const updatedGoal = await res.json();
      setGoals((prev) => prev.map((goal) => (goal._id === selectedGoal ? updatedGoal : goal)));
      setNewTarget("");
      setIsAddTargetOpen(false);
    } catch (error) {
      console.error("Error adding target:", error);
    }
  };

  // Toggle target completion
  const toggleTargetCompletion = async (targetId) => {
    if (!selectedGoal) return;
    try {
      const goal = currentGoal;
      const target = goal.targets.find((t) => t._id === targetId);
      if (!target) return;
      await fetch(`http://localhost:3001/api/progress/${selectedGoal}/targets/${targetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !target.completed }),
      });
      // Refetch the updated goal
      const res = await fetch(`http://localhost:3001/api/progress/${selectedGoal}`);
      const updatedGoal = await res.json();
      setGoals((prev) => prev.map((g) => (g._id === selectedGoal ? updatedGoal : g)));
    } catch (error) {
      console.error("Error toggling target completion:", error);
    }
  };

  // Mark a goal as completed
  const markGoalCompleted = async (goalId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/progress/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      const updatedGoal = await res.json();
      setGoals((prev) => prev.map((goal) => (goal._id === goalId ? updatedGoal : goal)));
    } catch (error) {
      console.error("Error marking goal completed:", error);
    }
  };

  // Delete a goal
  const deleteGoal = async (goalId) => {
    try {
      await fetch(`http://localhost:3001/api/progress/${goalId}`, {
        method: "DELETE",
      });
      setGoals((prev) => prev.filter((goal) => goal._id !== goalId));
      if (selectedGoal === goalId) {
        setSelectedGoal(goals.length > 0 ? goals[0]._id : null);
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  // Delete a target
  const deleteTarget = async (targetId) => {
    if (!selectedGoal) return;
    try {
      const res = await fetch(`http://localhost:3001/api/progress/${selectedGoal}/targets/${targetId}`, {
        method: "DELETE",
      });
      const updatedGoal = await res.json();
      setGoals((prev) => prev.map((goal) => (goal._id === selectedGoal ? updatedGoal : goal)));
    } catch (error) {
      console.error("Error deleting target:", error);
    }
  };

  // Calculate days remaining until deadline
  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const diffTime = new Date(deadline).getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-blue-900 mb-2 py-2 px-4"
            style={{ textShadow: "2px 2px 4px black" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Progress
          </motion.h1>
          <motion.p
            className="text-blue-700 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Set meaningful goals, create custom targets, and celebrate your academic achievements
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Goal List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-900">Your Goals</h2>
              <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" /> New Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                    <DialogDescription>
                      Set a clear, achievable goal with a deadline and track your progress with custom targets.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Goal Title
                      </label>
                      <Input
                        id="title"
                        placeholder="E.g., Complete Calculus Course"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description
                      </label>
                      <Textarea
                        id="description"
                        placeholder="Describe your goal in detail..."
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="deadline" className="text-sm font-medium">
                        Deadline
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newGoal.deadline ? format(newGoal.deadline, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newGoal.deadline}
                            onSelect={(date) => date && setNewGoal({ ...newGoal, deadline: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddGoal}>Create Goal</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {goals.map((goal) => (
                  <motion.div
                    key={goal._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        goal.completed
                          ? "border-green-500 bg-green-50"
                          : selectedGoal === goal._id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "bg-white/80 backdrop-blur-sm"
                      )}
                      onClick={() => setSelectedGoal(goal._id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              {goal.completed && <CheckCircle className="h-4 w-4 text-green-600 mr-1.5" />}
                              <h3 className="font-medium text-blue-900">
                                {goal.title || "Untitled Goal"}
                              </h3>
                            </div>
                            <div className="flex items-center text-sm text-blue-700">
                              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                              <span>{format(new Date(goal.deadline), "MMM d, yyyy")}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">{calculateProgress(goal)}%</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-400 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteGoal(goal._id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Progress
                          value={calculateProgress(goal)}
                          className={`h-1.5 mt-2 ${goal.completed ? "bg-green-200" : "bg-blue-200"}`}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 mr-2 opacity-80" />
                      <span>Total Goals</span>
                    </div>
                    <span className="font-bold">{goals.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2 opacity-80" />
                      <span>Completed</span>
                    </div>
                    <span className="font-bold">{goals.filter((goal) => goal.completed).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 opacity-80" />
                      <span>In Progress</span>
                    </div>
                    <span className="font-bold">{goals.filter((goal) => !goal.completed).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Selected Goal Details */}
          <div className="lg:col-span-2">
            {currentGoal ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentGoal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            {currentGoal.completed && <CheckCircle className="h-5 w-5 text-green-600 mr-2" />}
                            <CardTitle className="text-2xl font-bold text-blue-900">
                              {currentGoal.title || "Untitled Goal"}
                            </CardTitle>
                          </div>
                          <CardDescription className="mt-2 text-base">{currentGoal.description}</CardDescription>
                        </div>
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <CalendarIcon2 className="h-4 w-4 mr-1.5" />
                          <span>
                            {getDaysRemaining(currentGoal.deadline) > 0
                              ? `${getDaysRemaining(currentGoal.deadline)} days left`
                              : "Deadline passed"}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-700">Overall Progress</h3>
                          <span className="text-lg font-bold text-blue-700">{calculateProgress(currentGoal)}%</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-4 text-xs flex rounded-full bg-blue-100">
                            <motion.div
                              className={`flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                currentGoal.completed
                                  ? "bg-gradient-to-r from-green-500 to-green-600"
                                  : "bg-gradient-to-r from-blue-500 to-blue-600"
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${calculateProgress(currentGoal)}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                              {currentGoal.completed && <Trophy className="h-3 w-3 mx-auto" />}
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      {/* Targets */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-blue-900">Targets</h3>
                          {!currentGoal.completed && (
                            <Dialog open={isAddTargetOpen} onOpenChange={setIsAddTargetOpen}>
                              <DialogTrigger asChild>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <Plus className="h-4 w-4 mr-1.5" /> Add Target
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Add New Target</DialogTitle>
                                  <DialogDescription>
                                    Break down your goal into specific, achievable targets.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Input
                                    placeholder="E.g., Complete chapters 1-3"
                                    value={newTarget}
                                    onChange={(e) => setNewTarget(e.target.value)}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsAddTargetOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleAddTarget}>Add Target</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>

                        <div className="space-y-3">
                          <AnimatePresence>
                            {currentGoal.targets.map((target) => (
                              <motion.div
                                key={target._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center space-x-3 bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <ListTodo className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                                    <span
                                      className={`${target.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                                    >
                                      {target.title || "Untitled Target"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {!currentGoal.completed && !target.completed && (
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => toggleTargetCompletion(target._id)}
                                    >
                                      Done
                                    </Button>
                                  )}
                                  {target.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                                  {!currentGoal.completed && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-gray-400 hover:text-red-500"
                                      onClick={() => deleteTarget(target._id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {currentGoal.targets.length === 0 && (
                            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                              <Target className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                              <p>No targets yet. Add targets to track your progress.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Deadline Calendar */}
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Goal Deadline</h3>
                        <Card className="overflow-hidden border-blue-100">
                          <CardHeader className="bg-blue-50 pb-2 pt-4 px-4 border-b border-blue-100">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                                <h4 className="font-medium text-blue-800">
                                  {format(new Date(currentGoal.deadline), "MMMM yyyy")}
                                </h4>
                              </div>
                              <div className="flex items-center text-sm font-medium text-blue-700">
                                <Clock className="h-4 w-4 mr-1.5" />
                                <span>
                                  {getDaysRemaining(currentGoal.deadline) > 0
                                    ? `${getDaysRemaining(currentGoal.deadline)} days remaining`
                                    : "Deadline passed"}
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="p-3">
                              <Calendar
                                mode="single"
                                selected={new Date(currentGoal.deadline)}
                                onSelect={() => {}}
                                disabled
                                className="rounded-md"
                                classNames={{
                                  day_selected:
                                    "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                                  day_today: "bg-orange-100 text-orange-700",
                                  day: "h-9 w-9 text-center p-0 relative [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                  head_cell: "text-blue-600 font-semibold",
                                  cell: "p-0 relative [&:has([aria-selected])]:bg-blue-50",
                                  nav_button: "border border-blue-100 bg-white text-blue-600 hover:bg-blue-50",
                                  nav_button_previous: "absolute left-1",
                                  nav_button_next: "absolute right-1",
                                  caption: "relative py-4 px-10 text-center text-sm font-medium",
                                  table: "w-full border-collapse",
                                }}
                              />
                            </div>

                            {/* Deadline Indicator */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-t border-blue-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div
                                    className={`h-3 w-3 rounded-full mr-2 ${
                                      getDaysRemaining(currentGoal.deadline) > 7
                                        ? "bg-green-500"
                                        : getDaysRemaining(currentGoal.deadline) > 0
                                        ? "bg-orange-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>
                                  <span className="text-sm font-medium">
                                    {getDaysRemaining(currentGoal.deadline) > 7
                                      ? "On Track"
                                      : getDaysRemaining(currentGoal.deadline) > 0
                                      ? "Approaching Deadline"
                                      : "Deadline Passed"}
                                  </span>
                                </div>
                                <div className="text-sm text-blue-700">
                                  <span className="font-medium">Due:</span>{" "}
                                  {format(new Date(currentGoal.deadline), "EEEE, MMMM d, yyyy")}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-gray-50 flex justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Deadline:</span> {format(new Date(currentGoal.deadline), "MMMM d, yyyy")}
                      </div>
                      {currentGoal.completed ? (
                        <div className="flex items-center text-green-600">
                          <Trophy className="h-4 w-4 mr-1.5" />
                          <span className="font-medium">Goal Completed!</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => markGoalCompleted(currentGoal._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckSquare className="h-4 w-4 mr-1.5" />
                          Mark Goal Completed
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <Flag className="h-16 w-16 text-blue-300 mb-4" />
                <h3 className="text-xl font-semibold text-blue-900 mb-2">No Goals Yet</h3>
                <p className="text-blue-700 max-w-md mb-6">
                  Start by creating your first academic goal. Break it down into targets and track your progress.
                </p>
                <Button onClick={() => setIsAddGoalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" /> Create Your First Goal
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Motivational Footer without the "Explore Study Resources" button */}
        <div className="mt-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6 px-8 rounded-xl max-w-3xl mx-auto shadow-lg"
          >
            <h3 className="text-xl font-bold mb-2">Your Journey to Success</h3>
            <p className="text-blue-100 mb-4">
              "The secret of getting ahead is getting started. The secret of getting started is breaking your complex
              overwhelming tasks into small manageable tasks, and then starting on the first one."
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;