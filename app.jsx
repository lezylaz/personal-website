import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, setDoc, deleteDoc, query } from 'firebase/firestore';
import { Briefcase, GraduationCap, Lightbulb, Plane, MapPin, Plus, Edit, Trash2, Save, X, Menu, Languages, Computer, ShieldCheck, Mountain, Music, BookOpen, BookText, Beaker, Camera, Mail, Phone, Linkedin, Download, Send } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Icon Mapping ---
const IconMap = {
    Languages, Computer, ShieldCheck, Mountain, Music, BookOpen, Lightbulb, Plane, BookText, Beaker, Default: Lightbulb
};

// --- Main App Component ---
export default function App() {
    const [page, setPage] = useState('resume');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- Firebase State ---
    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // --- Data State ---
    const [profile, setProfile] = useState({
        name: "Lazar 'Eli' Strulovitch",
        bio: "IT professional and lifelong learner with a passion for cybersecurity, technology, and exploring the world.",
        location: "Brooklyn, NY",
        imageUrl: "https://placehold.co/150x150/6366f1/ffffff?text=ES",
        email: "eli.s@example.com",
        phone: "555-123-4567",
        linkedin: "linkedin.com/in/eli-strulovitch",
        resumeUrl: ""
    });
    const [experiences, setExperiences] = useState([]);
    const [education, setEducation] = useState([]);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [travels, setTravels] = useState([]);
    const [posts, setPosts] = useState([]);
    const [coursework, setCoursework] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Editing State ---
    const [editingItem, setEditingItem] = useState(null);
    const [editingType, setEditingType] = useState(null);

    // --- Firebase Initialization and Auth ---
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);
            setDb(dbInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) setUserId(user.uid);
                else {
                    try {
                        if (typeof __initial_auth_token !== 'undefined') await signInWithCustomToken(authInstance, __initial_auth_token);
                        else await signInAnonymously(authInstance);
                    } catch (error) { console.error("Error signing in:", error); }
                }
                setIsAuthReady(true);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase initialization error:", error);
            setIsAuthReady(true);
        }
    }, []);

    // --- Data Fetching and Seeding ---
    useEffect(() => {
        if (!isAuthReady || !db || !userId) {
            if (isAuthReady) setLoading(false);
            return;
        }

        const collections = {
            profile: setProfile,
            experiences: setExperiences,
            education: setEducation,
            projects: setProjects,
            skills: setSkills,
            travels: setTravels,
            posts: setPosts,
            coursework: setCoursework,
        };

        const unsubscribers = Object.entries(collections).map(([colName, setter]) => {
            const isSingleDoc = colName === 'profile';
            const path = isSingleDoc 
                ? doc(db, `artifacts/${appId}/users/${userId}/siteData/profile`)
                : collection(db, `artifacts/${appId}/users/${userId}/${colName}`);
            
            return onSnapshot(path, (snapshot) => {
                if (isSingleDoc) {
                    if (snapshot.exists()) setter(snapshot.data());
                    else seedInitialData(colName);
                } else {
                    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setter(items);
                    if (snapshot.docs.length === 0) seedInitialData(colName);
                }
            }, (error) => console.error(`Error fetching ${colName}:`, error));
        });

        setLoading(false);
        return () => unsubscribers.forEach(unsub => unsub());

    }, [isAuthReady, db, userId]);

    const seedInitialData = async (collectionName) => {
        if (!db || !userId) return;
        
        const initialData = {
            profile: { name: "Lazar 'Eli' Strulovitch", bio: "IT professional...", location: "Brooklyn, NY", imageUrl: "https://placehold.co/150x150/6366f1/ffffff?text=ES", email: "eli.s@example.com", phone: "555-123-4567", linkedin: "linkedin.com/in/eli-strulovitch", resumeUrl: ""},
            experiences: [{ id: 'exp1', title: 'IT Help Desk', company: 'Current IT Company', duration: 'Present', description: 'Provide technical support...', technologies: 'Active Directory, Office 365, Ticketing Systems', references: 'Available upon request' }],
            education: [
                { id: 'edu1', degree: 'Master of Science in Cybersecurity', institution: 'Current University', duration: 'In Progress', gpa: 'N/A', imageUrl: 'https://placehold.co/600x400/818cf8/ffffff?text=University' },
                { id: 'edu2', degree: 'Religious Education', institution: 'Yeshivas MIR, Jerusalem', duration: 'Completed', gpa: '3.8', imageUrl: 'https://placehold.co/600x400/a5b4fc/ffffff?text=Yeshiva' },
            ],
            projects: [{ id: 'proj1', title: 'Virtual Penetration Testing Lab', description: 'Designed and deployed a virtual network...', technologies: 'Docker, Kali Linux, Metasploit, Wireshark', link: 'https://github.com/example/pentest-lab' }],
            skills: [{ id: 'skill1', name: 'Languages', description: 'Fluent in Yiddish, Hebrew...', icon: 'Languages' }],
            travels: [{ id: 'travel1', location: 'Costa Rica', description: 'Walked through the Monteverde Cloud Forest.', icon: 'Mountain', imageUrl: 'https://placehold.co/600x400/34d399/ffffff?text=Costa+Rica', summary: 'The Monteverde Cloud Forest is a breathtaking example of biodiversity...', galleryUrl: 'https://photos.example.com/costa-rica' }],
            posts: [{ id: 'post1', title: 'My Journey into Linux', date: 'June 7, 2025', content: 'Switching from Windows to Linux felt like learning a new language...' }],
            coursework: [{id: 'cw1', name: 'Risk Management'}, {id: 'cw2', name: 'Digital Forensics'}, {id: 'cw3', name: 'Ethical Hacking'}],
        };

        if (collectionName === 'profile') {
            await handleSave('profile', initialData.profile);
        } else if (initialData[collectionName]) {
            for (const item of initialData[collectionName]) {
                 await handleSave(collectionName, item);
            }
        }
    };

    const handleSave = async (type, item) => {
        if (!db || !userId) return;
        const isSingleDoc = type === 'profile';
        const itemToSave = { ...item };
        let docRef;

        if (isSingleDoc) {
            docRef = doc(db, `artifacts/${appId}/users/${userId}/siteData/profile`);
        } else {
            const id = itemToSave.id || `${type}-${Date.now()}`;
            delete itemToSave.id;
            docRef = doc(db, `artifacts/${appId}/users/${userId}/${type}`, id);
        }

        try {
            await setDoc(docRef, itemToSave, { merge: true });
            setEditingItem(null);
            setEditingType(null);
        } catch (error) { console.error("Error saving document: ", error); }
    };

    const handleDelete = async (type, id) => {
        if (!db || !userId) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/${type}`, id));
        } catch (error) { console.error("Error deleting document: ", error); }
    };

    const handleEdit = (type, item) => {
        setEditingType(type);
        setEditingItem(item || {});
    };

    const handleAddNew = (type) => {
        const newItem = {
            experiences: { title: '', company: '', duration: '', description: '', technologies: '', references: '' },
            education: { degree: '', institution: '', duration: '', gpa: '', imageUrl: '' },
            projects: { title: '', description: '', technologies: '', link: '' },
            skills: { name: '', description: '', icon: 'Lightbulb' },
            travels: { location: '', description: '', icon: 'Plane', imageUrl: '', summary: '', galleryUrl: '' },
            posts: { title: '', date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), content: '' },
            coursework: { name: '' },
        }[type] || {};
        setEditingType(type);
        setEditingItem(newItem);
    };
    
    const renderContent = () => {
        if (loading) return <div className="text-center p-10">Loading your information...</div>;
        switch (page) {
            case 'resume': return <ResumePage profile={profile} experiences={experiences} education={education} projects={projects} skills={skills} coursework={coursework} onEdit={handleEdit} onDelete={handleDelete} onAddNew={handleAddNew} />;
            case 'travel': return <TravelPage travels={travels} onEdit={handleEdit} onDelete={handleDelete} onAddNew={handleAddNew} />;
            case 'blog': return <BlogPage posts={posts} onEdit={handleEdit} onDelete={handleDelete} onAddNew={handleAddNew} />;
            case 'contact': return <ContactPage profile={profile} />;
            default: return <div/>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                         <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">E</div>
                        <span className="text-lg font-semibold text-gray-700">Eli Strulovitch</span>
                    </div>
                    <div className="hidden md:flex items-center space-x-2">
                        <NavButton pageName="resume" currentPage={page} setPage={setPage}>Resume</NavButton>
                        <NavButton pageName="travel" currentPage={page} setPage={setPage}>Travels</NavButton>
                        <NavButton pageName="blog" currentPage={page} setPage={setPage}>Blog</NavButton>
                        <NavButton pageName="contact" currentPage={page} setPage={setPage}>Contact</NavButton>
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-indigo-600 focus:outline-none"><Menu size={24} /></button>
                    </div>
                </nav>
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white py-2 border-t">
                        <MobileNavButton pageName="resume" setPage={setPage} setMenuOpen={setIsMobileMenuOpen}>Resume</MobileNavButton>
                        <MobileNavButton pageName="travel" setPage={setPage} setMenuOpen={setIsMobileMenuOpen}>Travels</MobileNavButton>
                        <MobileNavButton pageName="blog" setPage={setPage} setMenuOpen={setIsMobileMenuOpen}>Blog</MobileNavButton>
                        <MobileNavButton pageName="contact" setPage={setPage} setMenuOpen={setIsMobileMenuOpen}>Contact</MobileNavButton>
                    </div>
                )}
            </header>
            <main className="container mx-auto p-4 md:p-8">
                {renderContent()}
            </main>
            {editingItem && <EditModal item={editingItem} type={editingType} onSave={handleSave} onClose={() => setEditingItem(null)} />}
            <footer className="text-center py-4 mt-8 text-xs text-gray-400">
                <p>App built by Gemini. User ID: {userId || 'Authenticating...'}</p>
            </footer>
        </div>
    );
}

// --- Navigation Components ---
const NavButton = ({ pageName, currentPage, setPage, children }) => (<button onClick={() => setPage(pageName)} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === pageName ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'}`}>{children}</button>);
const MobileNavButton = ({ pageName, setPage, setMenuOpen, children }) => (<button onClick={() => { setPage(pageName); setMenuOpen(false); }} className="block w-full text-left px-6 py-2 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600">{children}</button>);

// --- Page Components ---
const ResumePage = ({ profile, experiences, education, projects, skills, coursework, onEdit, onDelete, onAddNew }) => (
    <div className="bg-white p-6 sm:p-8 md:p-12 shadow-lg rounded-lg relative">
        {profile.resumeUrl && (
            <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="absolute top-6 right-6 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-semibold shadow">
                <Download size={16} className="mr-2" />
                Download Resume
            </a>
        )}
        <header className="relative group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left mb-10 pb-10 border-b">
            <img src={profile.imageUrl} alt={profile.name} className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-white mb-4 sm:mb-0 sm:mr-8" onError={(e) => { e.target.src='https://placehold.co/150x150/6366f1/ffffff?text=ES'; }}/>
            <div className="flex-grow">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{profile.name}</h1>
                <p className="mt-2 text-lg text-gray-600 max-w-2xl">{profile.bio}</p>
                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-sm text-gray-500">
                    <span className="flex items-center"><MapPin size={14} className="mr-1.5"/>{profile.location}</span>
                    <a href={`mailto:${profile.email}`} className="flex items-center hover:text-indigo-600"><Mail size={14} className="mr-1.5"/>{profile.email}</a>
                    <a href={`tel:${profile.phone}`} className="flex items-center hover:text-indigo-600"><Phone size={14} className="mr-1.5"/>{profile.phone}</a>
                    <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-indigo-600"><Linkedin size={14} className="mr-1.5"/>{profile.linkedin}</a>
                </div>
            </div>
            <div className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit('profile', profile)} className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 m-2"><Edit size={16} className="text-gray-600"/></button>
            </div>
        </header>

        <div className="space-y-12">
            <Section title="Work Experience" icon={<Briefcase />} onAddNew={() => onAddNew('experiences')}>
                {experiences.map(item => <ExperienceCard key={item.id} {...item} onEdit={() => onEdit('experiences', item)} onDelete={() => onDelete('experiences', item.id)} />)}
            </Section>
            
            <Section title="Education" icon={<GraduationCap />} onAddNew={() => onAddNew('education')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {education.map(item => <EducationCard key={item.id} {...item} onEdit={() => onEdit('education', item)} onDelete={() => onDelete('education', item.id)} />)}
                </div>
                <div className="pl-10 mt-8 space-y-8">
                    <SubSection title="School Projects" onAddNew={() => onAddNew('projects')}>
                        {projects.map(item => <ProjectCard key={item.id} {...item} onEdit={() => onEdit('projects', item)} onDelete={() => onDelete('projects', item.id)} />)}
                    </SubSection>
                    <SubSection title="Relevant Coursework" onAddNew={() => onAddNew('coursework')}>
                        <div className="flex flex-wrap gap-2">
                            {coursework.map(item => <Chip key={item.id} name={item.name} onEdit={() => onEdit('coursework', item)} onDelete={() => onDelete('coursework', item.id)} />)}
                        </div>
                    </SubSection>
                </div>
            </Section>

            <Section title="Skills" icon={<Lightbulb />} onAddNew={() => onAddNew('skills')}>
                <div className="grid sm:grid-cols-2 gap-6">
                    {skills.map(item => <SkillCard key={item.id} {...item} onEdit={() => onEdit('skills', item)} onDelete={() => onDelete('skills', item.id)} />)}
                </div>
            </Section>
        </div>
    </div>
);

const TravelPage = ({ travels, onEdit, onDelete, onAddNew }) => (
    <Section title="Travel Log" icon={<Plane />} onAddNew={() => onAddNew('travels')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {travels.map(item => <TravelCard key={item.id} {...item} onEdit={() => onEdit('travels', item)} onDelete={() => onDelete('travels', item.id)} />)}
        </div>
    </Section>
);

const BlogPage = ({ posts, onEdit, onDelete, onAddNew }) => (
    <Section title="Personal Blog" icon={<BookText />} onAddNew={() => onAddNew('posts')}>
        <div className="space-y-8">
            {posts.map(item => <PostCard key={item.id} {...item} onEdit={() => onEdit('posts', item)} onDelete={() => onDelete('posts', item.id)} />)}
        </div>
    </Section>
);

const ContactPage = ({ profile }) => (
    <div className="bg-white p-6 sm:p-8 md:p-12 shadow-lg rounded-lg max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Get In Touch</h1>
        <p className="text-center text-gray-600 mb-8">I'm open to new opportunities and collaborations. Feel free to reach out.</p>
        <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4 text-gray-700">
                    <a href={`mailto:${profile.email}`} className="flex items-center p-3 rounded-lg hover:bg-gray-50"><Mail size={20} className="mr-4 text-indigo-500"/><span>{profile.email}</span></a>
                    <a href={`tel:${profile.phone}`} className="flex items-center p-3 rounded-lg hover:bg-gray-50"><Phone size={20} className="mr-4 text-indigo-500"/><span>{profile.phone}</span></a>
                    <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg hover:bg-gray-50"><Linkedin size={20} className="mr-4 text-indigo-500"/><span>{profile.linkedin}</span></a>
                    <div className="flex items-center p-3 rounded-lg"><MapPin size={20} className="mr-4 text-indigo-500"/><span>{profile.location}</span></div>
                </div>
            </div>
            <div>
                 <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
                 <form action={`mailto:${profile.email}`} method="post" encType="text/plain">
                    <div className="space-y-4">
                        <FormInput label="Your Name" name="name" required />
                        <FormInput label="Your Email" name="email" type="email" required />
                        <FormTextarea label="Message" name="message" rows="5" required />
                        <button type="submit" className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 flex items-center justify-center">
                            <Send size={16} className="mr-2"/> Send Email
                        </button>
                    </div>
                 </form>
            </div>
        </div>
    </div>
);

// --- Reusable Components ---
const Section = ({ title, icon, children, onAddNew }) => (
    <section>
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center"><span className="text-indigo-500 mr-3">{icon}</span>{title}</h2>
            {onAddNew && <button onClick={onAddNew} className="flex items-center p-1 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"><Plus size={20} /></button>}
        </div>
        <div className="space-y-6">{children}</div>
    </section>
);

const SubSection = ({ title, children, onAddNew }) => (
    <section>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            <button onClick={onAddNew} className="flex items-center p-1 text-indigo-500 rounded-full hover:bg-indigo-100 transition-colors"><Plus size={16} /></button>
        </div>
        <div className="space-y-4">{children}</div>
    </section>
);

const CardBase = ({ children, onEdit, onDelete, noPadding=false }) => (
    <div className={`bg-white ${noPadding ? '' : 'p-4'} rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-300 relative group`}>
        {onEdit && onDelete && <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button onClick={onEdit} className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-600"><Edit size={12} /></button>
            <button onClick={onDelete} className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-600"><Trash2 size={12} /></button>
        </div>}
        {children}
    </div>
);

// --- Specific Card Components ---
const ExperienceCard = ({ title, company, duration, description, technologies, references, onEdit, onDelete }) => (
    <div className="relative group pl-6 border-l-2 border-gray-200">
        <div className="absolute -left-[11px] top-1 w-5 h-5 bg-white border-2 border-indigo-500 rounded-full"></div>
        <div className="absolute top-0 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
             <button onClick={onEdit} className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-600"><Edit size={12} /></button>
            <button onClick={onDelete} className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-600"><Trash2 size={12} /></button>
        </div>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                <p className="text-md text-indigo-600 font-semibold">{company}</p>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">{duration}</span>
        </div>
        <p className="mt-2 text-sm text-gray-600 pr-12">{description}</p>
        {technologies && <div className="mt-3 flex flex-wrap gap-2">{technologies.split(',').map(tech => tech.trim()).map((tech, i) => <Chip key={i} name={tech} isTech={true} />)}</div>}
        {references && <p className="mt-3 text-xs italic text-gray-500">References: {references}</p>}
    </div>
);

const EducationCard = ({ degree, institution, duration, gpa, imageUrl, onEdit, onDelete }) => (
    <CardBase onEdit={onEdit} onDelete={onDelete} noPadding={true}>
        <img src={imageUrl} alt={degree} className="w-full h-32 object-cover rounded-t-lg" onError={(e) => { e.target.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found'; }}/>
        <div className="p-4">
             <h3 className="font-bold text-md text-gray-900">{degree}</h3>
             <p className="text-sm text-indigo-600 font-semibold">{institution}</p>
             <div className="flex justify-between items-end mt-2 text-xs">
                {gpa && <p className="text-gray-500">GPA: {gpa}</p>}
                <span className="font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">{duration}</span>
             </div>
        </div>
    </CardBase>
);

const ProjectCard = ({ title, description, technologies, link, onEdit, onDelete }) => (
    <div className="relative group">
        <div className="absolute top-0 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
             <button onClick={onEdit} className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-600"><Edit size={12} /></button>
            <button onClick={onDelete} className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-600"><Trash2 size={12} /></button>
        </div>
        <h3 className="font-semibold text-md text-gray-800">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
        {technologies && <div className="mt-2 flex flex-wrap gap-2">{technologies.split(',').map(tech => tech.trim()).map((tech, i) => <Chip key={i} name={tech} isTech={true} />)}</div>}
        {link && <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mt-2 inline-block">View Project &rarr;</a>}
    </div>
);

const SkillCard = ({ name, description, icon, onEdit, onDelete }) => {
    const IconComponent = IconMap[icon] || IconMap.Default;
    return (
        <div className="relative group flex items-start space-x-4">
             <div className="absolute top-0 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button onClick={onEdit} className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-600"><Edit size={12} /></button>
                <button onClick={onDelete} className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-600"><Trash2 size={12} /></button>
            </div>
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center"><IconComponent size={22} /></div>
            <div>
                <h3 className="font-bold text-md text-gray-900">{name}</h3>
                <p className="text-gray-600 text-sm mt-0.5">{description}</p>
            </div>
        </div>
    );
};

const Chip = ({ name, onEdit, onDelete, isTech=false }) => (
    <div className={`relative group ${isTech ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'} text-xs font-medium px-3 py-1.5 rounded-full flex items-center`}>
        <span>{name}</span>
        {onEdit && onDelete && <div className="absolute -top-1 -right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button onClick={onEdit} className="p-1 bg-white text-gray-600 rounded-full shadow hover:bg-blue-100 hover:text-blue-600"><Edit size={10} /></button>
            <button onClick={onDelete} className="p-1 bg-white text-gray-600 rounded-full shadow hover:bg-red-100 hover:text-red-600"><Trash2 size={10} /></button>
        </div>}
    </div>
);

const TravelCard = ({ location, description, icon, imageUrl, summary, galleryUrl, onEdit, onDelete }) => {
    const IconComponent = IconMap[icon] || IconMap.Default;
    return (
        <CardBase onEdit={onEdit} onDelete={onDelete} noPadding={true}>
            <img src={imageUrl} alt={location} className="w-full h-48 object-cover rounded-t-lg" onError={(e) => { e.target.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found'; }}/>
            <div className="p-5">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center flex-shrink-0"><IconComponent size={22} /></div>
                    <h3 className="font-bold text-xl text-gray-900">{location}</h3>
                </div>
                <p className="text-gray-500 text-sm italic mb-3">"{description}"</p>
                <p className="text-gray-700 text-sm mb-4">{summary}</p>
                {galleryUrl && <a href={galleryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors"><Camera size={16} className="mr-1.5"/> View Photo Gallery</a>}
            </div>
        </CardBase>
    );
};

const PostCard = ({ title, date, content, onEdit, onDelete }) => (
    <CardBase onEdit={onEdit} onDelete={onDelete}>
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{date}</p>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
    </CardBase>
);

// --- Modal & Form Components ---
const EditModal = ({ item, type, onSave, onClose }) => {
    const [formData, setFormData] = useState(item);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(type, formData); };

    const renderFields = () => {
        switch (type) {
            case 'profile': return <> <FormInput label="Full Name" name="name" value={formData.name} onChange={handleChange} /> <FormInput label="Profile Image URL" name="imageUrl" value={formData.imageUrl} onChange={handleChange} /> <FormInput label="Resume PDF URL" name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} /> <FormTextarea label="Bio" name="bio" value={formData.bio} onChange={handleChange} rows={4}/> <FormInput label="Location" name="location" value={formData.location} onChange={handleChange} /> <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} /> <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} /> <FormInput label="LinkedIn URL" name="linkedin" value={formData.linkedin} onChange={handleChange} /> </>;
            case 'experiences': return <> <FormInput label="Job Title" name="title" value={formData.title} onChange={handleChange} /> <FormInput label="Company" name="company" value={formData.company} onChange={handleChange} /> <FormInput label="Duration" name="duration" value={formData.duration} onChange={handleChange} /> <FormTextarea label="Description" name="description" value={formData.description} onChange={handleChange} /> <FormInput label="Technologies (comma-separated)" name="technologies" value={formData.technologies} onChange={handleChange} /> <FormInput label="References" name="references" value={formData.references} onChange={handleChange} /> </>;
            case 'education': return <> <FormInput label="Degree/Certificate" name="degree" value={formData.degree} onChange={handleChange} /> <FormInput label="Institution" name="institution" value={formData.institution} onChange={handleChange} /> <FormInput label="Image URL" name="imageUrl" value={formData.imageUrl} onChange={handleChange} /> <FormInput label="Duration" name="duration" value={formData.duration} onChange={handleChange} /> <FormInput label="GPA (Optional)" name="gpa" value={formData.gpa} onChange={handleChange} /> </>;
            case 'projects': return <> <FormInput label="Project Title" name="title" value={formData.title} onChange={handleChange} /> <FormTextarea label="Description" name="description" value={formData.description} onChange={handleChange} /> <FormInput label="Technologies (comma-separated)" name="technologies" value={formData.technologies} onChange={handleChange} /> <FormInput label="Project Link (URL)" name="link" value={formData.link} onChange={handleChange} /> </>;
            case 'skills': return <> <FormInput label="Skill/Interest Name" name="name" value={formData.name} onChange={handleChange} /> <FormTextarea label="Description" name="description" value={formData.description} onChange={handleChange} /> <FormSelect label="Icon" name="icon" value={formData.icon} onChange={handleChange} options={Object.keys(IconMap)} /> </>;
            case 'travels': return <> <FormInput label="Location" name="location" value={formData.location} onChange={handleChange} /> <FormInput label="Cover Image URL" name="imageUrl" value={formData.imageUrl} onChange={handleChange}/> <FormInput label="Photo Gallery URL" name="galleryUrl" value={formData.galleryUrl} onChange={handleChange} /> <FormInput label="Short Description" name="description" value={formData.description} onChange={handleChange} /> <FormTextarea label="Full Summary" name="summary" value={formData.summary} onChange={handleChange} rows={5}/> <FormSelect label="Icon" name="icon" value={formData.icon} onChange={handleChange} options={Object.keys(IconMap)} /> </>;
            case 'posts': return <> <FormInput label="Post Title" name="title" value={formData.title} onChange={handleChange} /> <FormInput label="Date" name="date" value={formData.date} onChange={handleChange} /> <FormTextarea label="Content" name="content" value={formData.content} onChange={handleChange} rows={10}/> </>;
            case 'coursework': return <> <FormInput label="Course Name" name="name" value={formData.name} onChange={handleChange} /> </>;
            default: return <p>Invalid editing type.</p>;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">Edit {type.charAt(0).toUpperCase() + type.slice(1).replace(/s$/, '')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    {renderFields()}
                    <div className="flex justify-end pt-4 space-x-3 border-t mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"><Save size={16} className="mr-2"/>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Form Field Components ---
const FormInput = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" {...props} /></div>);
const FormTextarea = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><textarea className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" {...props}></textarea></div>);
const FormSelect = ({ label, options, ...props }) => (<div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white" {...props}>{options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>);
