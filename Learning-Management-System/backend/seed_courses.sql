USE lms;

INSERT INTO course (course_id, course_name, price, instructor, description, p_link, y_link) VALUES
(UUID_TO_BIN(UUID()), 'Python Programming', 499, 'Dr. Angela Yu',
 'Learn Python from scratch with hands-on projects covering data types, functions, OOP, and automation.',
 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
 'https://www.youtube.com/watch?v=rfscVS0vtbw'),
(UUID_TO_BIN(UUID()), 'JavaScript Essentials', 599, 'Brad Traversy',
 'Master modern JavaScript including ES6+, DOM manipulation, async programming, and APIs.',
 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80',
 'https://www.youtube.com/watch?v=PkZNo7MFNFg'),
(UUID_TO_BIN(UUID()), 'React Fundamentals', 699, 'Maximilian S.',
 'Build dynamic single-page applications with React, hooks, components, and state management.',
 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
 'https://www.youtube.com/watch?v=bMknfKXIFA8'),
(UUID_TO_BIN(UUID()), 'Java for Beginners', 549, 'Tim Buchalka',
 'A complete introduction to Java covering syntax, OOP, collections, and building real applications.',
 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
 'https://www.youtube.com/watch?v=eIrMbAQSU34'),
(UUID_TO_BIN(UUID()), 'Data Structures & Algorithms', 799, 'Abdul Bari',
 'Understand core data structures and algorithms with clear explanations and problem solving.',
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
 'https://www.youtube.com/watch?v=8hly31xKli0'),
(UUID_TO_BIN(UUID()), 'HTML & CSS Web Design', 399, 'Jonas Schmedtmann',
 'Design beautiful, responsive websites from scratch using modern HTML5 and CSS3 techniques.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
 'https://www.youtube.com/watch?v=mU6anWqZJcc');

SELECT COUNT(*) AS course_count FROM course;
