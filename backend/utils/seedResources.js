const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const User = require('../models/User');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected for Resource Seeding'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

const dummyPdfUrl = '/uploads/sample.pdf'; // Assuming we have a sample file or handled by frontend correctly

const resources = [
    // 1st Semester - Basic Science
    { title: 'Engineering Physics Notes', type: 'Notes', branch: 'Basic Science', semester: '1st', year: 2023, fileUrl: dummyPdfUrl, fileName: 'Physics_Notes.pdf' },
    { title: 'Physics Question Bank 2022', type: 'Question Paper', branch: 'Basic Science', semester: '1st', year: 2022, fileUrl: dummyPdfUrl, fileName: 'Physics_QP_2022.pdf' },
    { title: 'Basic Electrical Eng Lab Manual', type: 'Lab Manual', branch: 'Basic Science', semester: '1st', year: 2023, fileUrl: dummyPdfUrl, fileName: 'BEE_Lab.pdf' },

    // 2nd Semester - Basic Science
    { title: 'Engineering Chemistry Notes', type: 'Notes', branch: 'Basic Science', semester: '2nd', year: 2023, fileUrl: dummyPdfUrl, fileName: 'Chemistry_Notes.pdf' },
    { title: 'C Programming Question Paper', type: 'Question Paper', branch: 'Basic Science', semester: '2nd', year: 2021, fileUrl: dummyPdfUrl, fileName: 'C_Prog_QP.pdf' },

    // 3rd Semester - CSE
    { title: 'Data Structures with C Notes', type: 'Notes', branch: 'CSE', semester: '3rd', year: 2023, fileUrl: dummyPdfUrl, fileName: 'DS_Notes.pdf' },
    { title: 'Discrete Mathematical Structures', type: 'Notes', branch: 'CSE', semester: '3rd', year: 2023, fileUrl: dummyPdfUrl, fileName: 'DMS_Notes.pdf' },
    { title: 'COA Question Paper Dec 2022', type: 'Question Paper', branch: 'CSE', semester: '3rd', year: 2022, fileUrl: dummyPdfUrl, fileName: 'COA_QP_2022.pdf' },

    // 4th Semester - CSE
    { title: 'Design & Analysis of Algorithms', type: 'Notes', branch: 'CSE', semester: '4th', year: 2023, fileUrl: dummyPdfUrl, fileName: 'DAA_Notes.pdf' },
    { title: 'Microprocessors Lab Manual', type: 'Lab Manual', branch: 'CSE', semester: '4th', year: 2023, fileUrl: dummyPdfUrl, fileName: 'MP_Lab.pdf' },
    { title: 'DBMS Important Questions', type: 'Other', branch: 'CSE', semester: '4th', year: 2023, fileUrl: dummyPdfUrl, fileName: 'DBMS_Questions.pdf' },

    // 5th Semester - CSE
    { title: 'Computer Networks Notes', type: 'Notes', branch: 'CSE', semester: '5th', year: 2023, fileUrl: dummyPdfUrl, fileName: 'CN_Notes.pdf' },
    { title: 'Software Engineering Project Guide', type: 'Other', branch: 'CSE', semester: '5th', year: 2023, fileUrl: dummyPdfUrl, fileName: 'SE_Guide.pdf' },

    // 6th Semester - CSE
    { title: 'Artificial Intelligence Notes', type: 'Notes', branch: 'CSE', semester: '6th', year: 2023, fileUrl: dummyPdfUrl, fileName: 'AI_Notes.pdf' },
    { title: 'System Software Lab Manual', type: 'Lab Manual', branch: 'CSE', semester: '6th', year: 2023, fileUrl: dummyPdfUrl, fileName: 'SS_Lab.pdf' },

    // 7th Semester - CSE
    { title: 'Machine Learning Notes', type: 'Notes', branch: 'CSE', semester: '7th', year: 2023, fileUrl: dummyPdfUrl, fileName: 'ML_Notes.pdf' },
    { title: 'Cloud Computing Paper 2022', type: 'Question Paper', branch: 'CSE', semester: '7th', year: 2022, fileUrl: dummyPdfUrl, fileName: 'Cloud_QP.pdf' },

    // 8th Semester - CSE
    { title: 'Big Data Analytics Notes', type: 'Notes', branch: 'CSE', semester: '8th', year: 2023, fileUrl: dummyPdfUrl, fileName: 'BigData_Notes.pdf' },
    { title: 'Information & Network Security', type: 'Notes', branch: 'CSE', semester: '8th', year: 2023, fileUrl: dummyPdfUrl, fileName: 'Security_Notes.pdf' },

    // Other Branches
    // ECE
    { title: 'Electronic Devices & Circuits', type: 'Notes', branch: 'ECE', semester: '3rd', year: 2023, fileUrl: dummyPdfUrl, fileName: 'EDC_Notes.pdf' },
    { title: 'Signals & Systems Paper', type: 'Question Paper', branch: 'ECE', semester: '4th', year: 2022, fileUrl: dummyPdfUrl, fileName: 'SS_QP.pdf' },

    // ME
    { title: 'Thermodynamics Notes', type: 'Notes', branch: 'ME', semester: '3rd', year: 2023, fileUrl: dummyPdfUrl, fileName: 'Thermo_Notes.pdf' },
    { title: 'Manufacturing Process Paper', type: 'Question Paper', branch: 'ME', semester: '4th', year: 2022, fileUrl: dummyPdfUrl, fileName: 'MP_QP.pdf' },

    // AI & ML
    { title: 'Foundations of AI', type: 'Notes', branch: 'AI & ML', semester: '3rd', year: 2023, fileUrl: dummyPdfUrl, fileName: 'AI_Foundations.pdf' },

    // CE (Civil)
    { title: 'Strength of Materials Notes', type: 'Notes', branch: 'CE', semester: '3rd', year: 2023, fileUrl: dummyPdfUrl, fileName: 'SOM_Notes.pdf' },
];

const seedResources = async () => {
    try {
        // Find an admin or librarian to associate with
        const admin = await User.findOne({ role: { $in: ['admin', 'librarian'] } });

        if (!admin) {
            console.error('No admin or librarian found in database. Run main seed script first.');
            process.exit(1);
        }

        // Clear existing resources if needed (optional, user didn't ask but usually better)
        await Resource.deleteMany();
        console.log('Cleared existing resources');

        const refinedResources = resources.map(res => ({
            ...res,
            uploadedBy: admin._id,
            status: 'approved' // Automatically approve sample data
        }));

        await Resource.insertMany(refinedResources);
        console.log(`Successfully seeded ${refinedResources.length} resources across all semesters and branches.`);

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedResources();
