// Pre-built sample analysis results for instant hackathon demo (no API key needed)

export const SAMPLE_CBC = {
    summary: "Your complete blood count shows mostly healthy results. A couple of values are slightly outside the typical range, but nothing that needs immediate worry. These are great topics for your next doctor visit.",
    documentType: "lab_report",
    urgencyLevel: "attention_needed",
    metrics: [
        {
            name: "Hemoglobin",
            value: "11.2",
            unit: "g/dL",
            normalRange: "12.0 - 15.5 g/dL",
            status: "slightly_low",
            explanation: "Your hemoglobin is a tiny bit below the usual range. Think of hemoglobin as the delivery trucks that carry oxygen to every part of your body. Having slightly fewer trucks means your cells might not get as much oxygen, which could make you feel a bit tired.",
            icon: "🩸"
        },
        {
            name: "White Blood Cells (WBC)",
            value: "7,500",
            unit: "cells/mcL",
            normalRange: "4,500 - 11,000 cells/mcL",
            status: "normal",
            explanation: "Your white blood cells are in the healthy range. These are your body's security guards — they fight off infections and keep you protected. Your immune system looks like it's doing its job well!",
            icon: "🛡️"
        },
        {
            name: "Platelets",
            value: "245,000",
            unit: "/mcL",
            normalRange: "150,000 - 400,000 /mcL",
            status: "normal",
            explanation: "Your platelet count is perfectly normal. Platelets are like tiny repair workers that rush to fix cuts and stop bleeding. Yours are well within the healthy range.",
            icon: "🩹"
        },
        {
            name: "Red Blood Cells (RBC)",
            value: "4.1",
            unit: "million/mcL",
            normalRange: "4.2 - 5.4 million/mcL",
            status: "slightly_low",
            explanation: "Your red blood cell count is just slightly below the usual range. Red blood cells are the main carriers of oxygen throughout your body. This small dip might be connected to the slightly lower hemoglobin too.",
            icon: "🔴"
        },
        {
            name: "Hematocrit",
            value: "38",
            unit: "%",
            normalRange: "36 - 46%",
            status: "normal",
            explanation: "Your hematocrit level is in the normal range. This tells us the proportion of your blood that's made up of red blood cells, and yours looks just right.",
            icon: "💉"
        },
        {
            name: "Mean Corpuscular Volume (MCV)",
            value: "85",
            unit: "fL",
            normalRange: "80 - 100 fL",
            status: "normal",
            explanation: "The size of your red blood cells is perfectly normal. This is good news — it means your cells are the right size to carry oxygen efficiently.",
            icon: "🔬"
        }
    ],
    healthStory: "Overall, your blood test paints a mostly positive picture. Your immune system is working well, and most of your blood values are right where they should be. The one thing worth noting is that your hemoglobin and red blood cell count are just a tiny bit below the usual range. This doesn't mean anything is wrong — it could be related to your diet, hydration, or even your menstrual cycle if applicable. Think of it like a car that has a full tank of gas but could use a little more oil. It still runs fine, but topping up would help it run even better. This is a great topic to bring up with your doctor, who might suggest simple changes like eating more iron-rich foods.",
    actionItems: [
        "🍎 Consider adding iron-rich foods to your diet — like spinach, lentils, beans, and red meat",
        "💧 Stay well-hydrated — aim for 8 glasses of water daily",
        "📅 Schedule a follow-up with your doctor to discuss the slightly low hemoglobin",
        "😴 Make sure you're getting 7-8 hours of quality sleep",
        "🏃 Continue regular, moderate physical activity"
    ],
    doctorQuestions: [
        "My hemoglobin is 11.2, which is slightly below normal. Should I be concerned?",
        "Would you recommend any dietary changes or supplements to improve my iron levels?",
        "How often should I get my blood count checked?",
        "Could my current lifestyle or diet be contributing to the lower hemoglobin?",
        "Are there any symptoms I should watch out for?"
    ],
    glossary: [
        { term: "Hemoglobin (Hb)", definition: "A protein in red blood cells that carries oxygen from your lungs to the rest of your body." },
        { term: "WBC (White Blood Cells)", definition: "Your body's defense cells that fight infections, viruses, and bacteria." },
        { term: "Platelets", definition: "Tiny cell fragments that help your blood clot and stop bleeding when you get a cut." },
        { term: "RBC (Red Blood Cells)", definition: "Cells that carry oxygen throughout your body and remove carbon dioxide." },
        { term: "Hematocrit", definition: "The percentage of your blood that is made up of red blood cells." },
        { term: "MCV", definition: "A measure of the average size of your red blood cells." }
    ],
    piiFound: ["Patient Name", "Date of Birth", "Hospital ID"]
};

export const SAMPLE_DIABETES = {
    summary: "Your diabetes screening panel shows that your blood sugar levels are higher than the typical range. This is important information to share with your doctor, but it's not an emergency. With the right guidance, these numbers can often be improved.",
    documentType: "lab_report",
    urgencyLevel: "attention_needed",
    metrics: [
        {
            name: "HbA1c (Glycated Hemoglobin)",
            value: "7.2",
            unit: "%",
            normalRange: "Below 5.7%",
            status: "high",
            explanation: "Your HbA1c gives a picture of your average blood sugar over the past 2-3 months — like a report card for blood sugar. At 7.2%, it's above the usual range. Think of it like your car's fuel gauge being consistently set a bit too high. This is a really important number to discuss with your doctor.",
            icon: "📊"
        },
        {
            name: "Fasting Blood Sugar",
            value: "142",
            unit: "mg/dL",
            normalRange: "70 - 100 mg/dL",
            status: "high",
            explanation: "Your fasting blood sugar is higher than the typical range. This is the amount of sugar in your blood after not eating overnight. Think of it like a glass that has more water than it should — your body might need some help managing the sugar levels.",
            icon: "🍬"
        },
        {
            name: "Post-Meal Blood Sugar",
            value: "195",
            unit: "mg/dL",
            normalRange: "Below 140 mg/dL",
            status: "high",
            explanation: "Your blood sugar after meals is higher than expected. After eating, your body converts food into sugar. Normally, insulin acts like a key that opens cells to let sugar in for energy. Your numbers suggest the key might not be working as smoothly.",
            icon: "🍽️"
        },
        {
            name: "Total Cholesterol",
            value: "210",
            unit: "mg/dL",
            normalRange: "Below 200 mg/dL",
            status: "slightly_high",
            explanation: "Your total cholesterol is just a touch above the desired range. Cholesterol is like wax in your blood — a little is needed, but too much can build up in your blood vessels like grease in a pipe.",
            icon: "🫀"
        },
        {
            name: "LDL Cholesterol",
            value: "138",
            unit: "mg/dL",
            normalRange: "Below 100 mg/dL",
            status: "high",
            explanation: "Your LDL (often called 'bad' cholesterol) is above the optimal range. Think of LDL as delivery trucks that can leave extra packages (cholesterol) on the walls of your blood vessels. Having fewer of these trucks is better for your heart health.",
            icon: "📦"
        },
        {
            name: "Kidney Function (Creatinine)",
            value: "0.9",
            unit: "mg/dL",
            normalRange: "0.7 - 1.3 mg/dL",
            status: "normal",
            explanation: "Your kidney function looks healthy! Your kidneys are like filters that clean your blood. This normal result is encouraging and shows they're doing their job well.",
            icon: "🫘"
        }
    ],
    healthStory: "Your diabetes panel tells an important story about how your body is managing sugar. Your blood sugar levels — both fasting and after meals — are higher than the typical ranges, and your HbA1c confirms this has been the pattern over the past few months. Think of it like a thermostat that's been set a bit too high — your body's sugar regulation system could use some attention. The positive news is that your kidneys are functioning well, which is something doctors always want to check. Your cholesterol is also slightly elevated, which sometimes goes hand-in-hand with blood sugar changes. These results aren't a reason to panic — they're a signal that now is a great time to work with your doctor on a plan.",
    actionItems: [
        "📅 Schedule an appointment with your doctor to discuss these results — this is priority #1",
        "🍎 Focus on balanced meals with more vegetables, whole grains, and lean proteins",
        "🏃 Aim for at least 30 minutes of walking or light exercise most days",
        "💧 Increase your water intake and reduce sugary drinks",
        "📝 Consider keeping a simple food diary to share with your doctor"
    ],
    doctorQuestions: [
        "My HbA1c is 7.2% — what does this mean for my long-term health?",
        "What dietary changes would have the biggest impact on my blood sugar?",
        "Do I need medication, or can I manage this with lifestyle changes first?",
        "How does my high LDL cholesterol relate to my blood sugar levels?",
        "How often should I monitor my blood sugar going forward?"
    ],
    glossary: [
        { term: "HbA1c", definition: "A blood test that shows your average blood sugar level over the past 2-3 months." },
        { term: "Fasting Blood Sugar", definition: "The level of sugar in your blood after not eating for at least 8 hours." },
        { term: "LDL Cholesterol", definition: "Often called 'bad' cholesterol — it can build up in your blood vessels." },
        { term: "Creatinine", definition: "A waste product filtered by your kidneys — used to check if your kidneys are working well." },
        { term: "Insulin", definition: "A hormone made by your body that helps move sugar from your blood into your cells for energy." }
    ],
    piiFound: ["Patient Name", "Address", "Phone Number"]
};

export const SAMPLE_DISCHARGE = {
    summary: "This is a discharge summary following an appendix removal surgery. The surgery went well, and the medical team has provided clear instructions for your recovery at home. Following these guidelines will help you heal smoothly.",
    documentType: "discharge_summary",
    urgencyLevel: "routine",
    metrics: [
        {
            name: "Surgery Status",
            value: "Successful",
            unit: "",
            normalRange: "N/A",
            status: "normal",
            explanation: "Your appendix removal surgery (appendectomy) was completed successfully without any complications. The surgical team was happy with how everything went.",
            icon: "✅"
        },
        {
            name: "Hospital Stay",
            value: "2 days",
            unit: "",
            normalRange: "1-3 days typical",
            status: "normal",
            explanation: "You spent 2 days in the hospital, which is a typical stay for this type of surgery. This means your recovery started off on the right track.",
            icon: "🏥"
        },
        {
            name: "Post-Op Temperature",
            value: "98.6",
            unit: "°F",
            normalRange: "97.8 - 99.1°F",
            status: "normal",
            explanation: "Your temperature at discharge was perfectly normal. This is a good sign that there's no infection present.",
            icon: "🌡️"
        },
        {
            name: "Pain Level at Discharge",
            value: "3/10",
            unit: "",
            normalRange: "Expected 2-4/10",
            status: "normal",
            explanation: "Your pain level was mild at discharge, which is expected and manageable. This should continue to improve over the coming days.",
            icon: "💊"
        }
    ],
    healthStory: "Great news — your appendix removal surgery went smoothly! Think of your appendix like a small pocket attached to your intestine. Sometimes it gets inflamed and needs to be removed to prevent bigger problems. Your surgical team successfully removed it, and your body responded well. During your 2-day hospital stay, your temperature stayed normal and your pain was well-managed, both of which are signs of a healthy start to recovery. Now, the most important phase begins — your recovery at home. Your body needs time and gentle care to heal from the inside out, much like how a garden needs water and sunlight to grow back after pruning.",
    actionItems: [
        "🛏️ Rest for 1-2 weeks — avoid lifting anything heavier than 10 pounds",
        "💊 Take prescribed pain medication as directed — don't skip doses for the first few days",
        "🩹 Keep your surgical wound clean and dry — follow the dressing change instructions",
        "🍲 Start with light, easy-to-digest foods like soup, rice, and toast for the first few days",
        "📞 Call your doctor immediately if you notice fever, increasing pain, redness around the wound, or unusual discharge"
    ],
    doctorQuestions: [
        "When can I return to my normal daily activities?",
        "What signs of infection should I watch for at the wound site?",
        "When should I come back for a follow-up check?",
        "Are there any foods I should avoid during recovery?",
        "When is it safe to start light exercise again?"
    ],
    glossary: [
        { term: "Appendectomy", definition: "A surgery to remove the appendix — a small, finger-shaped organ attached to your large intestine." },
        { term: "Post-Operative", definition: "The period of time after a surgery, during which your body recovers." },
        { term: "Discharge Summary", definition: "A document your hospital gives you when you leave, summarizing your treatment and recovery instructions." },
        { term: "Laparoscopic", definition: "A type of surgery done through small cuts using a tiny camera, instead of one large cut. This usually means faster healing." }
    ],
    piiFound: ["Patient Name", "Hospital Registration No.", "Date of Birth", "Address"]
};

export const SAMPLE_REPORTS = {
    cbc: SAMPLE_CBC,
    diabetes: SAMPLE_DIABETES,
    discharge: SAMPLE_DISCHARGE,
};
