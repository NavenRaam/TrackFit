import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PulseLoader } from 'react-spinners';
import {
    CheckCircle, XCircle, ArrowLeft, ArrowRight, Save, User, Cake, Scale, Dumbbell,
    ClipboardList, Calendar, Clock, MapPin, Heart, Activity, Flame, UtensilsCrossed,
    Apple, AlertTriangle, Ban, NotebookPen, Target, Ruler
} from 'lucide-react';
import { useSession } from 'next-auth/react';

// This is a self-contained component, assuming Tailwind CSS is available.
// The UI has been completely redesigned to be more visually distinct and modern,
// moving away from a direct mimic of the reference image while using it as inspiration.
// It features a more spacious and structured layout in display mode and improved form transitions.

const formVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.98 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: 50, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } },
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

// Reusable Input Component
const InputField = ({ label, name, value, onChange, type = "text", placeholder, className = "", required = true, min, max }) => (
    <motion.div variants={cardVariants} className={`relative group ${className}`}>
        <label className="block mb-1 text-sm font-medium text-white/80 group-focus-within:text-cyan-300 transition-colors duration-200 capitalize">
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/15 transition-all duration-200 border border-white/20"
            required={required}
            min={min}
            max={max}
        />
    </motion.div>
);

// Reusable Select Component
const SelectField = ({ label, name, value, onChange, options, className = "", required = true }) => (
    <motion.div variants={cardVariants} className={`relative group ${className}`}>
        <label className="block mb-1 text-sm font-medium text-white/80 group-focus-within:text-cyan-300 transition-colors duration-200 capitalize">
            {label}
        </label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/15 transition-all duration-200 border border-white/20 appearance-none pr-8 cursor-pointer"
            required={required}
        >
            <option value="" disabled className="bg-gray-800 text-white/70">Select an option</option>
            {options.map((opt) => (
                <option key={opt} value={opt} className="bg-gray-800 text-white">{opt}</option>
            ))}
        </select>
        {/* Custom arrow for select */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none top-6">
            <svg className="h-5 w-5 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </div>
    </motion.div>
);

// A modern, centered notification component instead of a simple div
const Notification = ({ message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const Icon = type === 'success' ? CheckCircle : XCircle;

    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-2xl text-white z-50 ${bgColor} transition-opacity duration-300 flex items-center space-x-3 max-w-sm`}
        >
            <Icon className="h-6 w-6" />
            <span className="flex-grow">{message}</span>
            <button onClick={onClose} className="font-bold text-lg leading-none hover:text-white/80 transition-colors">&times;</button>
        </motion.div>
    );
};

// Circular Progress Bar component
const CircularProgressBar = ({ percentage }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    className="text-gray-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="64"
                    cy="64"
                />
                <motion.circle
                    className="text-emerald-400"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="64"
                    cy="64"
                    strokeLinecap="round"
                    style={{ strokeDasharray: circumference, strokeDashoffset }}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <span className="absolute text-2xl font-bold text-white">{percentage}%</span>
        </div>
    );
};

// A redesigned card for displaying profile details
const ProfileDetailCard = ({ label, value, icon: Icon, span = 1 }) => (
    <motion.div
        variants={cardVariants}
        className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 flex flex-col items-start border border-white/10 shadow-lg transform hover:scale-[1.02] transition-transform duration-200 col-span-1 md:col-span-${span}`}
    >
        <div className="flex items-center text-cyan-400 mb-3">
            <Icon className="h-6 w-6 mr-2" />
            <span className="text-sm font-semibold text-gray-300">{label}</span>
        </div>
        <p className="text-xl text-white font-bold">{value || 'N/A'}</p>
    </motion.div>
);

// Main Profile Component
export default function Profile() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({
        age: '', gender: '', height: '', weight: '', fitnessGoal: '',
        activityLevel: '', targetWeight: '', durationWeeks: '', workoutDaysPerWeek: '',
        preferredWorkoutDurationMinutes: '', experienceLevel: '', workoutLocation: '',
        preferredWorkouts: '', dietType: '', mealsPerDay: '', allergies: '', dislikes: '',
        otherNotes: '', maintenanceCalories: '',
    });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [step, setStep] = useState(1);
    const [viewMode, setViewMode] = useState('basic'); // 'basic' or 'plan'

    // Fetch existing profile data
    const fetchProfile = useCallback(async () => {
        if (!session?.user?.email) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/profile?email=${encodeURIComponent(session.user.email)}`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setProfile(data);
                    // Populate form with existing data
                    setForm({
                        age: data.age || '',
                        gender: data.gender || '',
                        height: data.height || '',
                        weight: data.weight || '',
                        fitnessGoal: data.fitnessGoal || '',
                        activityLevel: data.activityLevel || '',
                        targetWeight: data.targetWeight || '',
                        durationWeeks: data.durationWeeks || '',
                        workoutDaysPerWeek: data.workoutDaysPerWeek || '',
                        preferredWorkoutDurationMinutes: data.preferredWorkoutDurationMinutes || '',
                        experienceLevel: data.experienceLevel || '',
                        workoutLocation: data.workoutLocation || '',
                        preferredWorkouts: Array.isArray(data.preferredWorkouts) ? data.preferredWorkouts.join(', ') : '',
                        dietType: data.dietaryPreferences?.dietType || '',
                        mealsPerDay: data.dietaryPreferences?.mealsPerDay || '',
                        allergies: Array.isArray(data.dietaryPreferences?.allergies) ? data.dietaryPreferences.allergies.join(', ') : '',
                        dislikes: Array.isArray(data.dietaryPreferences?.dislikes) ? data.dietaryPreferences.dislikes.join(', ') : '',
                        otherNotes: data.dietaryPreferences?.otherNotes || '',
                        maintenanceCalories: data.maintenanceCalories || '',
                    });
                    setEditMode(false);
                } else {
                    setEditMode(true); // No profile found, start creation mode
                }
            } else {
                setEditMode(true); // API error, start creation mode
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            setNotification({ message: 'Failed to load profile. Please try again.', type: 'error' });
            setEditMode(true);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchProfile();
        }
    }, [status, fetchProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleNext = (e) => {
        // Prevent form submission and only progress if the current step is valid
        e.preventDefault();
        const currentStepFields = getStepFields(step);
        const isCurrentStepValid = currentStepFields.every(field => {
            const fieldValue = form[field];
            // Check for required fields based on the field name
            if (fieldValue === '') {
                // Special case for non-required fields
                if (field === 'preferredWorkouts' || field === 'allergies' || field === 'dislikes' || field === 'otherNotes') {
                    return true;
                }
                return false;
            }
            if (field === 'maintenanceCalories') {
                return form.fitnessGoal !== 'Maintenance' || (form.fitnessGoal === 'Maintenance' && fieldValue !== '');
            }
            return true;
        });

        if (isCurrentStepValid) {
            setStep((prevStep) => prevStep + 1);
        } else {
            setNotification({ message: 'Please fill in all required fields to proceed.', type: 'error' });
        }
    };

    const handlePrevious = () => {
        setStep((prevStep) => prevStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification(null);

        const preparedData = {
            email: session.user.email,
            ...form,
            // Convert comma-separated strings to arrays
            preferredWorkouts: form.preferredWorkouts ? form.preferredWorkouts.split(',').map(item => item.trim()).filter(Boolean) : [],
            dietaryPreferences: {
                dietType: form.dietType,
                mealsPerDay: form.mealsPerDay,
                allergies: form.allergies ? form.allergies.split(',').map(item => item.trim()).filter(Boolean) : [],
                dislikes: form.dislikes ? form.dislikes.split(',').map(item => item.trim()).filter(Boolean) : [],
                otherNotes: form.otherNotes,
            }
        };

        // Remove top-level dietaryPreferences fields that are now nested
        delete preparedData.dietType;
        delete preparedData.mealsPerDay;
        delete preparedData.allergies;
        delete preparedData.dislikes;
        delete preparedData.otherNotes;

        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preparedData),
            });

            if (res.ok) {
                const updatedProfile = await res.json();
                setProfile(updatedProfile);
                setNotification({ message: 'Profile saved successfully!', type: 'success' });
                setEditMode(false);
                setStep(1);

                // CRITICAL: Call the calculate-metrics endpoint
                await fetch('/api/profile/calculate-metrics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: session.user.email }),
                });

                // Re-fetch profile to get updated metrics
                fetchProfile();

            } else {
                const errorData = await res.json();
                console.error("Profile save error:", errorData);
                setNotification({ message: errorData.error || 'Failed to save profile. Please check your inputs.', type: 'error' });
            }
        } catch (error) {
            console.error("Network or unexpected error during profile save:", error);
            setNotification({ message: 'An unexpected error occurred. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
            // Don't auto-clear success messages, user may want to read them
            if (notification?.type === 'error') {
                setTimeout(() => setNotification(null), 5000);
            }
        }
    };
    
    // Utility to get the list of fields for a given step
    const getStepFields = (currentStep) => {
        if (currentStep === 1) {
            return ['age', 'gender', 'height', 'weight', 'fitnessGoal', 'activityLevel'];
        }
        if (currentStep === 2) {
            const fields = ['targetWeight', 'durationWeeks', 'experienceLevel', 'workoutDaysPerWeek', 'preferredWorkoutDurationMinutes', 'workoutLocation'];
            // Exclude targetWeight if goal is not weight loss or muscle gain
            if (form.fitnessGoal !== 'Weight Loss' && form.fitnessGoal !== 'Muscle Gain') {
                return fields.filter(f => f !== 'targetWeight');
            }
            return fields;
        }
        if (currentStep === 3) {
            const fields = ['dietType', 'mealsPerDay', 'allergies', 'dislikes', 'otherNotes'];
            // Conditionally add maintenanceCalories field
            if (form.fitnessGoal === 'Maintenance') {
                return [...fields, 'maintenanceCalories'];
            }
            return fields;
        }
        return [];
    };
    
    // FIX: Correctly calculate the completion percentage based on user-fillable fields
    const calculateProfileCompletion = () => {
        const allFields = [
            'age', 'gender', 'height', 'weight', 'fitnessGoal', 'activityLevel',
            'durationWeeks', 'experienceLevel', 'workoutDaysPerWeek', 'preferredWorkoutDurationMinutes',
            'workoutLocation', 'preferredWorkouts', 'dietType', 'mealsPerDay', 'allergies',
            'dislikes', 'otherNotes'
        ];
    
        // Conditionally add fields based on fitness goal
        if (profile?.fitnessGoal === 'Maintenance' || form.fitnessGoal === 'Maintenance') {
            allFields.push('maintenanceCalories');
        }
        if (profile?.fitnessGoal === 'Weight Loss' || profile?.fitnessGoal === 'Muscle Gain' ||
            form.fitnessGoal === 'Weight Loss' || form.fitnessGoal === 'Muscle Gain') {
            allFields.push('targetWeight');
        }
        
        let completedCount = 0;
        let totalCount = allFields.length;
    
        // Use the profile data if available, otherwise use the form state
        const sourceData = profile || form;
    
        allFields.forEach(field => {
            let value = sourceData[field];
    
            // Handle nested dietaryPreferences fields
            if (['dietType', 'mealsPerDay', 'allergies', 'dislikes', 'otherNotes'].includes(field)) {
                value = sourceData.dietaryPreferences?.[field];
            }
    
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    completedCount++;
                }
            } else if (value) {
                completedCount++;
            }
        });
    
        // Ensure the percentage doesn't exceed 100%
        const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        return Math.min(Math.round(percentage), 100);
    };

    const completionPercentage = calculateProfileCompletion();

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <PulseLoader color="#06B6D4" size={15} />
            </div>
        );
    }

    if (!session) {
        return <AccessDeniedMessage />;
    }
    
    // UI improvement to be a better version of the user's reference image
    return (
        <div className="min-h-screen w-full  text-white flex flex-col antialiased">
            
            {/* Main Content Area */}
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-6xl p-8  rounded-3xl shadow-2xl ">
                    <AnimatePresence>
                        {notification && (
                            <Notification
                                message={notification.message}
                                type={notification.type}
                                onClose={() => setNotification(null)}
                            />
                        )}
                    </AnimatePresence>

                    {!editMode && profile ? (
                        // Display mode
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-12"
                        >
                            <div className="flex flex-col items-center justify-center text-center">
                                <h1 className="text-5xl font-extrabold mb-2 text-white">
                                    Hello, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">{session?.user?.name || "User"}</span>
                                </h1>
                                <p className="text-md text-gray-400">
                                    Here's a detailed overview of your fitness journey.
                                </p>
                            </div>

                            {/* Main Content Layout */}
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Left Column: Progress & Quick Stats */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="md:w-1/3 flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/10 shadow-xl"
                                >
                                    <div className="mb-6">
                                        <CircularProgressBar percentage={completionPercentage} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-200 mb-2">Profile Completion</h3>
                                    <p className="text-gray-400 text-sm text-center mb-6">
                                        Fill out all details to get the most accurate plan.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <ProfileDetailCard label="Age" value={profile.age} icon={Cake} />
                                        <ProfileDetailCard label="Height" value={`${profile.height} cm`} icon={Ruler} />
                                        <ProfileDetailCard label="Weight" value={`${profile.weight} kg`} icon={Scale} />
                                        <ProfileDetailCard label="Goal" value={profile.fitnessGoal} icon={Dumbbell} />
                                    </div>
                                </motion.div>

                                {/* Right Column: Detailed Plan Sections */}
                                <div className="md:w-2/3 space-y-6">
                                    <div className="flex justify-center md:justify-start space-x-4 mb-8">
                                        <button
                                            onClick={() => setViewMode('basic')}
                                            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center ${viewMode === 'basic' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                        >
                                            <User className="h-5 w-5 mr-2" />
                                            Basic Info
                                        </button>
                                        <button
                                            onClick={() => setViewMode('plan')}
                                            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center ${viewMode === 'plan' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                        >
                                            <ClipboardList className="h-5 w-5 mr-2" />
                                            Plan Details
                                        </button>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {viewMode === 'basic' && (
                                            <motion.div
                                                key="basic-view"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                            >
                                                <ProfileDetailCard label="Age" value={profile.age} icon={Cake} />
                                                <ProfileDetailCard label="Gender" value={profile.gender} icon={User} />
                                                <ProfileDetailCard label="Height (cm)" value={profile.height} icon={Ruler} />
                                                <ProfileDetailCard label="Weight (kg)" value={profile.weight} icon={Scale} />
                                                <ProfileDetailCard label="Fitness Goal" value={profile.fitnessGoal} icon={Dumbbell} />
                                                <ProfileDetailCard label="Activity Level" value={profile.activityLevel} icon={Activity} />
                                            </motion.div>
                                        )}

                                        {viewMode === 'plan' && (
                                            <motion.div
                                                key="plan-view"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                            >
                                                {profile.targetWeight && <ProfileDetailCard label="Target Weight (kg)" value={profile.targetWeight} icon={Target} />}
                                                <ProfileDetailCard label="Plan Duration" value={`${profile.durationWeeks} weeks`} icon={Calendar} />
                                                <ProfileDetailCard label="Workout Days" value={`${profile.workoutDaysPerWeek} days/week`} icon={Clock} />
                                                <ProfileDetailCard label="Workout Duration" value={`${profile.preferredWorkoutDurationMinutes} min`} icon={Clock} />
                                                <ProfileDetailCard label="Experience Level" value={profile.experienceLevel} icon={Dumbbell} />
                                                <ProfileDetailCard label="Workout Location" value={profile.workoutLocation} icon={MapPin} />
                                                <ProfileDetailCard label="Preferred Workouts" value={Array.isArray(profile.preferredWorkouts) && profile.preferredWorkouts.length > 0 ? profile.preferredWorkouts.join(', ') : 'N/A'} icon={Heart} span={3} />
                                                <ProfileDetailCard label="Diet Type" value={profile.dietaryPreferences?.dietType} icon={UtensilsCrossed} />
                                                <ProfileDetailCard label="Meals Per Day" value={profile.dietaryPreferences?.mealsPerDay} icon={Apple} />
                                                <ProfileDetailCard label="Allergies" value={Array.isArray(profile.dietaryPreferences?.allergies) && profile.dietaryPreferences.allergies.length > 0 ? profile.dietaryPreferences.allergies.join(', ') : 'None'} icon={AlertTriangle} />
                                                <ProfileDetailCard label="Dislikes" value={Array.isArray(profile.dietaryPreferences?.dislikes) && profile.dietaryPreferences.dislikes.length > 0 ? profile.dietaryPreferences.dislikes.join(', ') : 'None'} icon={Ban} />
                                                <ProfileDetailCard label="Target Calories" value={profile.targetCalories} icon={Flame} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 uppercase tracking-wide"
                                >
                                    <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit Profile
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        // Edit mode
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <h2 className="text-3xl font-extrabold text-center text-cyan-300">
                                <span className="block mb-2 text-white/50 text-base font-medium">Step {step} of 3</span>
                                {step === 1 && "Personal Information"}
                                {step === 2 && "Fitness & Workout Preferences"}
                                {step === 3 && "Dietary & Other Notes"}
                            </h2>

                            <AnimatePresence mode="wait">
                                {/* ----- Step 1: Basic Info ----- */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        variants={formVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <InputField type="number" label="Age" name="age" value={form.age} onChange={handleChange} placeholder="e.g., 30" min="13" max="100" />
                                        <SelectField
                                            label="Gender"
                                            name="gender"
                                            value={form.gender}
                                            onChange={handleChange}
                                            options={["Male", "Female", "Other"]}
                                        />
                                        <InputField type="number" label="Height (cm)" name="height" value={form.height} onChange={handleChange} placeholder="e.g., 175" />
                                        <InputField type="number" label="Weight (kg)" name="weight" value={form.weight} onChange={handleChange} placeholder="e.g., 70" />
                                        <SelectField
                                            label="Fitness Goal"
                                            name="fitnessGoal"
                                            value={form.fitnessGoal}
                                            onChange={handleChange}
                                            options={["Weight Loss", "Muscle Gain", "Maintenance", "Improve Endurance"]}
                                            className="md:col-span-2"
                                        />
                                        <SelectField
                                            label="Activity Level"
                                            name="activityLevel"
                                            value={form.activityLevel}
                                            onChange={handleChange}
                                            options={["Sedentary", "Lightly Active", "Moderately Active", "Very Active", "Extra Active"]}
                                            className="md:col-span-2"
                                        />
                                    </motion.div>
                                )}

                                {/* ----- Step 2: Goal-Specific Info ----- */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        variants={formVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        {(form.fitnessGoal === 'Weight Loss' || form.fitnessGoal === 'Muscle Gain') && (
                                            <InputField type="number" label="Target Weight (kg)" name="targetWeight" value={form.targetWeight} onChange={handleChange} placeholder="e.g., 65" />
                                        )}
                                        <InputField type="number" label="Plan Duration (weeks)" name="durationWeeks" value={form.durationWeeks} onChange={handleChange} placeholder="e.g., 12" min="1" max="52" />
                                        <SelectField
                                            label="Experience Level"
                                            name="experienceLevel"
                                            value={form.experienceLevel}
                                            onChange={handleChange}
                                            options={['Beginner', 'Intermediate', 'Advanced']}
                                        />
                                        <InputField type="number" label="Workout Days Per Week" name="workoutDaysPerWeek" value={form.workoutDaysPerWeek} onChange={handleChange} placeholder="e.g., 3" min="1" max="7" />
                                        <InputField type="number" label="Preferred Workout Duration (minutes)" name="preferredWorkoutDurationMinutes" value={form.preferredWorkoutDurationMinutes} onChange={handleChange} placeholder="e.g., 60" min="20" max="120" />
                                        <SelectField
                                            label="Workout Location"
                                            name="workoutLocation"
                                            value={form.workoutLocation}
                                            onChange={handleChange}
                                            options={["Home", "Gym", "Outdoor", "Any"]}
                                        />
                                        <InputField type="text" label="Preferred Workouts (comma-separated)" name="preferredWorkouts" value={form.preferredWorkouts} onChange={handleChange} placeholder="e.g., Strength, Cardio, Yoga" className="md:col-span-2" required={false} />
                                    </motion.div>
                                )}

                                {/* ----- Step 3: Diet & Other Info ----- */}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        variants={formVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <SelectField
                                            label="Diet Type"
                                            name="dietType"
                                            value={form.dietType}
                                            onChange={handleChange}
                                            options={["None", "Vegan", "Vegetarian", "Keto", "Paleo", "Pescatarian", "Balanced", "Mediterranean"]}
                                        />
                                        <InputField type="number" label="Meals Per Day" name="mealsPerDay" value={form.mealsPerDay} onChange={handleChange} placeholder="e.g., 3" min="1" max="6" />
                                        <InputField type="text" label="Allergies (comma-separated)" name="allergies" value={form.allergies} onChange={handleChange} placeholder="e.g., Gluten, Peanuts" className="md:col-span-2" required={false} />
                                        <InputField type="text" label="Disliked Foods (comma-separated)" name="dislikes" value={form.dislikes} onChange={handleChange} placeholder="e.g., Olives, Mushrooms" className="md:col-span-2" required={false} />
                                        <InputField type="text" label="Other Dietary Notes" name="otherNotes" value={form.otherNotes} onChange={handleChange} placeholder="e.g., No red meat" className="md:col-span-2" required={false} />
                                        
                                        {form.fitnessGoal === 'Maintenance' && (
                                            <InputField type="number" label="Maintenance Calories" name="maintenanceCalories" value={form.maintenanceCalories} onChange={handleChange} placeholder="e.g., 2000" className="md:col-span-2" />
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center mt-6">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={handlePrevious}
                                        className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full shadow transition duration-300"
                                    >
                                        <ArrowLeft className="h-5 w-5 mr-2" />
                                        Previous
                                    </button>
                                )}

                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ml-auto transform hover:scale-105`}
                                    >
                                        Next
                                        <ArrowRight className="h-5 w-5 ml-2" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-full shadow-lg transition-all duration-300 ml-auto transform hover:scale-105`}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <PulseLoader size={8} color="#fff" />
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5 mr-2" />
                                                Save Profile
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// Access denied component
const AccessDeniedMessage = () => (
    <div className="min-h-screen flex items-center justify-center text-white text-xl p-6 bg-gradient-to-br from-gray-900 to-indigo-950">
        <p>Access denied. Please log in to view or update your profile.</p>
    </div>
);
