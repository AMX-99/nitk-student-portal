const students = [
    {
        "id": "577ea3e9-d836-4e09-b52e-484008fc0205",
        "name": "Rahul Sharma",
        "roll_no": "2K21/CO/101"
    }
];

const attendance = {
    "2K21/CO/101": true
};

const records = Object.entries(attendance).map(([roll, present]) => {
    const studentObj = students.find((s, i) => {
        const sData = s.students || s.student || s;
        return (s.roll_no || sData.roll_no || s.id || `idx-${i}`) === roll;
    });
    return {
        student_id: studentObj?.id,
        status: present ? 'P' : 'A',
    };
}).filter(r => r.student_id);

console.log("Records Generated:", records);
