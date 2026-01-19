import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { config } from '../config/index.js';
import { User, Page, SiteSettings } from '../models/index.js';
import { hashPassword } from '../services/auth.service.js';
import { initializeSiteSettings } from '../services/settings.service.js';

async function seed() {
    console.log('🌱 Starting database seed...');

    try {
        await connectDB();

        // 1. Create Admin User
        console.log('👤 Creating admin user...');
        const existingAdmin = await User.findOne({ email: config.admin.email });

        let adminUser;
        if (existingAdmin) {
            console.log('   Admin user already exists, skipping...');
            adminUser = existingAdmin;
        } else {
            const passwordHash = await hashPassword(config.admin.password);
            adminUser = await User.create({
                name: 'Admin',
                email: config.admin.email,
                passwordHash,
                role: 'admin',
            });
            console.log(`   ✅ Created admin: ${config.admin.email}`);
        }

        // 2. Create Editor User
        console.log('👤 Creating editor user...');
        const existingEditor = await User.findOne({ email: 'editor@barby.co.il' });

        if (existingEditor) {
            console.log('   Editor user already exists, skipping...');
        } else {
            const editorPasswordHash = await hashPassword('editor123456');
            await User.create({
                name: 'Editor',
                email: 'editor@barby.co.il',
                passwordHash: editorPasswordHash,
                role: 'editor',
            });
            console.log('   ✅ Created editor: editor@barby.co.il');
        }

        // 3. Initialize Site Settings
        console.log('⚙️ Initializing site settings...');
        await initializeSiteSettings(adminUser._id.toString());
        console.log('   ✅ Site settings initialized');

        // 4. Create Default Pages
        console.log('📄 Creating default pages...');
        const pages = [
            {
                key: 'about',
                title: 'אודות',
                contentRichText: `<p>מועדון בארבי הוקם בשנת 1994 ע״י שאול ואריאלה מזרחי, בתחילת דרכם הוקם הבארבי ברח׳ יונה הנביא ושימש כבית קפה עם במה קטנה ואינטימית.</p>
<p>לאחר מכן הועתק המועדון לרח׳ סלמה ואז עבר לקיבוץ גלויות 52 בת״א וכיום בארבי במשכנו החדש – בנמל יפו 1.</p>
<p>בארבי הוקם בעיקר כדי לשמש במה לאמנים ישראליים מקוריים, אך גם לארח אמנים בינלאומיים. במהלך השנים עלו על במת הבארבי אמנים רבים, הן ישראליים והן בינלאומיים, כגון: שלמה ארצי, אריק איינשטיין, יהודית רביץ, רמי קלינשטיין, אביב גפן, Berry Sakharof, שלומי שבת, עברי לידר, ומאות רבות נוספים.</p>
<p>בארבי הפך עם השנים לאחד ממועדוני המוזיקה החיה המובילים בישראל, ומהווה בית לאמנות מקורית ואיכותית.</p>
<p>המועדון מציע חוויה אינטימית וייחודית, עם אקוסטיקה מעולה ואווירה שאין כמוה.</p>
<p><strong>ברוכים הבאים לבארבי – הבית של המוזיקה החיה בישראל</strong></p>`,
            },
            {
                key: 'terms',
                title: 'תקנון אתר בארבי',
                contentRichText: `<h2>1. אבטחת מידע</h2>
<p>אתר בארבי פועל בטכנולוגית הצפנת המידע SSL. פרוטוקול זה נהוג בכל אתרי הקניות המובילים בעולם והוא תנאי הכרחי למכירת מוצרים באתר.</p>

<h2>2. פרטי אשראי</h2>
<p>כל הפרטי האשראי של הרוכשים באתר נשמרים בשרת מאובטח שאינו ניתן לגישה. חשוב לציין, כי מבחינת חברות כרטיסי האשראי דינה של עסקת מכירה באינטרנט הינה כדין עסקה במסמך חסר. כלומר, בעל כרטיס האשראי מוגן מפני שימוש לרעה בכרטיסו.</p>

<h2>3. תשלום</h2>
<p>התשלום באתר בכרטיס אשראי ובתשלום אחד.</p>

<h2>4. החלפת כרטיסים</h2>
<p>אין אפשרות להחליף כרטיסים שנרכשו באתר בכרטיסים למופע/אירוע אחר רק באישור המשרד שלנו.</p>

<h2>5. פרטי מזמין</h2>
<p>על המזמין חלה חובה להזין פרטים מלאים זמינים ונכונים לצורך קבלת מידע אודות האירוע אליו הוזמנו הכרטיסים (כדוגמת ביטול או שינוי)!</p>
<p><strong>⚠️ במידה ויוזנו פרטים ליצירת קשר שאינם נכונים האחריות תחול על המזמין בלבד!!!</strong></p>

<h2>6. שינוי מועד מופע</h2>
<p>היה ונשלחה הודעה על שינוי מועד המופע אליו הזמנתם כרטיסים ובשל השינוי תרצו לבטל את הרכישה יש להודיע על כך במייל שירות הלקוחות בצירוף מספר הזמנה והזיכוי בכרטיס האשראי יינתן תוך 7 ימי עסקים מיום ההודעה!</p>

<h2>7. פורס מז'ור</h2>
<p>במקרים של פורס מז'ור - מקרים שאינם תלויים במועדון בארבי כגון: מחלה של האומן, מלחמה, מבצע, אסון חלילה ועוד והיה ונאלצנו לדחות את המופע בשל זאת, נדאג לתאריך חלופי שנודיע עליו לכל הרוכשים. על הרוכש חלה אחריות של עד 14 ימי עסקים לא לבטל את הכרטיס מיום ההודעה על הדחייה.</p>

<h2>8. הצגת כרטיס</h2>
<p>יש להציג את הכרטיס האלקטרוני / הברקוד / או מספר הזמנה שקיבלת במייל ביום הרכישה.</p>

<h2>9. מדיניות החזרת מוצר ע"פ חוק</h2>
<p>לא יינתן זיכוי 7 ימים לפני שהמופע מתקיים ו-14 יום מביצוע העסקה.</p>
<blockquote>
<p><strong>ציטוט החוק:</strong></p>
<p>"(ג) בעסקת מכר מרחוק רשאי הצרכן לבטל בכתב את העסקה –</p>
<p>(2) בשירות - בתוך ארבעה עשר ימים מיום עשיית העסקה או מיום קבלת המסמך המכיל את הפרטים האמורים בסעיף קטן (ב), לפי המאוחר, כמפורט להלן: בעסקה מתמשכת – בין אם הוחל במתן השירות ובין אם לאו, ובעסקה שאינה עסקה מתמשכת – בתנאי שביטול כאמור ייעשה לפחות שני ימים, שאינם ימי מנוחה, קודם למועד שבו אמור השירות להינתן.</p>
<p>(ד) הוראות סעיף קטן (ג) לא יחולו על עסקת מכר מרחוק של –</p>
<p>(1) טובין פסידים;</p>
<p>(2) שירותי הארחה, נסיעה, חופש או בילוי, אם מועד ביטול העסקה חל בתוך שבעה ימים שאינם ימי מנוחה, קודם למועד שבו אמור השירות להינתן."</p>
</blockquote>

<h2>10. דמי ביטול</h2>
<p>במקרה של ביטול בהתאם לתקנון, בארבי תחייב את הלקוח בדמי ביטול ששיעורם לא יעלה על 5% ממחיר העסקה, או ב-100 ש"ח, לפי הנמוך מבניהם. בקשת הביטול תתבצע בפנייה למייל שירות הלקוחות בלבד והזיכוי יבוצע בתוך 7-14 ימי עסקים וע"פ החוק.</p>

<h2>11. ביטול לאחר אזילת כרטיסים</h2>
<p>לא ניתן לבטל כרטיסים לאחר שנמכרו כל הכרטיסים למופע/אירוע.</p>

<h2>12. ביטול כרטיסים בודדים</h2>
<p>לא ניתן לבטל כרטיסים בודדים ברכישה מרוכזת רק באישור של בארבי במייל שירות הלקוחות.</p>

<h2>13. גיפט קארד</h2>
<p>כרטיסים הנרכשים במימוש גיפט קארד לא ניתן לבטל או לזכות. במקרה של ביטול הופעה ניתן לעבור למופע אחר בלבד ובאותו הסכום במדויק. היה ותרצו לעבור למופע אחר בסכום מופחת לא יינתן הפרש לכרטיסים! לא ניתן לקבל זיכוי לאשראי של מקבל הגיפט קארד.</p>

<h2>14. אי הגעה</h2>
<p>במקרה של אי הגעה למופע לא יינתן זיכוי כספי.</p>

<h2>15. אחריות</h2>
<p>למען הסר ספק בארבי הינו חלל אשר מוצגים בו מגוון תכנים. אין המועדון וההנהלה אחראית על תוכן שלא הובן או הוצג כראוי. האחריות הבלעדית הינה של מארגן המופע. הנהלת בארבי אינה אחראית על טיב ההופעה, איכות, וחוקיות המופע וכן אינה אחראית על תוכנו.</p>

<h2>16. רשימת המתנה</h2>
<p>אנו עושים מאמצים לייצר תכנים איכותיים. לדאבוננו הרב למקום יש כמות הכלה לפי רישוי עסקים ועל כן במופעי סולד אאוט נוצרה רשימת המתנה לאלו שרוצים לרכוש כרטיסים. כשמועדון בארבי מודיע כי אזלו הכרטיסים אנו מתכוונים לכך. והיכולת לרכוש כרטיסים תלויה בביטולים בלבד.</p>

<h2>17. מלווה לנכה</h2>
<p>לגבי חוק מלווה בחינם לנכה - במועדון הבארבי שבו יש הקצאת מושבים למופעי ישיבה והקצאת מקום למופעי עמידה (בשל המגבלה בתפוסת המועדון בהתאם לרישיון המועדון) אין פטור מתשלום למלווה של אדם עם מוגבלות, גם אם אותו אדם מחזיק בתעודה המציינת זכאות למלווה.</p>

<h2>18. בקבוקי שתייה</h2>
<p>הכניסה למתחם המועדון עם בקבוקי שתייה אסורה והיא ע"פ שיקולינו הבלעדי בלבד (וזאת למען אכיפה פלילית וע"פ התייעצות עם משטרת ישראל).</p>

<h2>19. גיל כניסה</h2>
<p>הכניסה לבארבי מגיל 7 ומעלה.</p>

<h2>20. נשק</h2>
<p><strong>⚠️ ע"פ הוראות המשטרה הכניסה עם נשק אסורה!</strong></p>

<h2>21. יציאה מהמתחם</h2>
<p>היציאה מהמתחם לאחר כניסתך לא תתאפשר אלא אם ברצונך לעזוב ללא שוב!</p>`,
            },
            {
                key: 'accessibility',
                title: 'הסדרי נגישות מועדון בארבי',
                contentRichText: `<p>מועדון בארבי רואה חשיבות רבה בנושא המחויבות לנגישות, שוויון, אי אפליה ושרות נגיש לאנשים עם מוגבלות תשנ"ח-1998 ובהתאם לתקנות החדשות שקיימות מיולי 2014.</p>
<p>ההתאמות מבוצעות בשלבים, על פי ההגדרות והמועדים החדשים שנקבעו בחוק נגישות אתרי אינטרנט.</p>

<h2>נגישות האתר</h2>
<p>באתר בארבי מותקן תוסף נגישות בצד שמאל למטה. תוסף זה מאפשר לכלל הגולשים בעלי הלקויות והמוגבלויות לגלוש באתר ולהשתמש בו לפי התאמת צרכי הגלישה שלהם. הרכיב ידידותי לשימוש, נוח ויעיל, ומסייע בהנגשה.</p>

<h2>נגישות המועדון</h2>
<ul>
<li>חניית נכים בחניון הסמוך למועדון בארבי</li>
<li>שירות לקוחות בבארבי נגיש והמענה הקולי מוקלט בשפה ברורה וללא מוסיקת רקע</li>
<li>לולאת השראה - מערכת עזר לשמיעה במועדון בארבי נגישה בקופת המועדון וכן בבר המשקאות</li>
<li>ניתן לפנות לקופה בכניסה למקום</li>
<li>דרכי גישה למשרדי בארבי – נציג מטעמנו יקבל את פני בעל המוגבלות בכניסה המרושתת במצלמות</li>
<li>המופעים בעמידה. כיסא יינתן לבעלי המוגבלות בלבד נושאי תעודת נכה</li>
</ul>

<h2>אמצעים חלופיים ליצירת קשר</h2>
<p>מייל ייעודי לנגישות: <a href="mailto:barbycs52@gmail.com">barbycs52@gmail.com</a></p>

<h2>רכזת נגישות</h2>
<p><strong>שם:</strong> אריאל</p>
<p><strong>טלפון:</strong> <a href="tel:050-8264433">050-8264433</a></p>
<p>פניות לרכזת נגישות בימים א׳ עד ה׳ 11:00-18:00 (לא כולל שבתות וחגים)</p>

<p>בבארבי עושים ככל יכולתנו להנגיש את האולם לכל בעלי המוגבלויות. האתר משתנה ומתעדכן כל הזמן.</p>
<p>היה ונתקלתם בבעיית נגישות באתר, נשמח אם תשתפו אותנו. אנא חייגו לטלפון <a href="tel:03-5188123">03-5188123</a> בימים א׳-ה׳ משעה 11:30 ועד 18:00 ואנו נעשה את מירב המאמצים לסייע.</p>`,
            },
            {
                key: 'privacy',
                title: 'מדיניות פרטיות',
                contentRichText: `<p>מסמך מדיניות הפרטיות זמין להורדה בקישור הבא.</p>
<p><em>PDF זמין להורדה במערכת הניהול.</em></p>`,
            },
            {
                key: 'contact',
                title: 'צור קשר',
                contentRichText: `<h2>שירות לקוחות</h2>
<p>שירות הלקוחות של בארבי פועל במייל זה:</p>
<p><a href="mailto:barby@barbycs.com"><strong>barby@barbycs.com</strong></a></p>

<h2>שעות פעילות</h2>
<p>ימים א׳ - ה׳ בין השעות 11:30 עד 18:00</p>
<p><em>מייל זה אינו פועל בערבי חג, חג ושבת</em></p>

<h2>בכל פנייה יש לשלוח אלינו</h2>
<ul>
<li>מספר ההזמנה בגוף המייל</li>
<li>מספר ת.ז</li>
<li>4 ספרות אשראי אחרונות</li>
<li>מספר טלפון שאיתו בוצעה ההזמנה</li>
</ul>
<p>נא לא לשלוח קבצים רק אם נבקש</p>
<p><strong>מייל שישלח ואז תיצרו קשר בטלפון לא יטופל!</strong></p>

<h2>זמן תגובה</h2>
<p>אנחנו נענה לכולם, בתוך 2 ימי עסקים מקבלת המייל</p>
<p>ובהתאם לתקנון האתר ולחוק הגנת הצרכן, לטובתכם... או שלא</p>
<p><em>* שליחת הבקשה אינה מהווה פתרון ללא מענה ספציפי *</em></p>

<h2>כתובת</h2>
<p>הנמל 1, נמל יפו, תל אביב יפו, ישראל</p>
<p><a href="https://www.google.com/maps/dir/?api=1&destination=Barby%20Nemal%20Yafo%20Street%2C%20Tel%20Aviv-Yafo%2C%20Israel" target="_blank" rel="noopener noreferrer">פתח ב-Google Maps ←</a></p>`,
            },
            {
                key: 'mailing-list',
                title: 'הסרה מרשימת תפוצה',
                contentRichText: `<p>הזינו את הפרטים להסרה מרשימת התפוצה</p>
<p>בנוסף להסרה מרשימת הדיוור, ניתן לשלוח אלינו אימייל לכתובת: <a href="mailto:barby@barbycs.com"><strong>barby@barbycs.com</strong></a></p>`,
            },
        ];

        for (const pageData of pages) {
            const existing = await Page.findOne({ key: pageData.key });
            if (!existing) {
                await Page.create({
                    ...pageData,
                    updatedBy: adminUser._id,
                });
                console.log(`   ✅ Created page: ${pageData.key}`);
            } else {
                console.log(`   Page ${pageData.key} already exists, skipping...`);
            }
        }

        // 5. Create Sample Shows
        console.log('🎸 Creating sample shows...');
        const { Show } = await import('../models/index.js');

        const sampleShows = [
            {
                title: 'גל דה פז',
                description: '<p>מופע להקה מיוחד עם מלא אורחים, אורחות ועוד הפתעות!</p>',
                dateISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                doorsTime: '20:30',
                status: 'available',
                venueName: 'בארבי',
                venueAddress: 'קיבוץ גלויות 52, תל אביב',
                ticketTiers: [{ label: 'כניסה', price: 95, currency: 'ILS' }],
                tags: ['רוק', 'ישראלי'],
                featured: true,
                published: true,
                archived: false,
                createdBy: adminUser._id,
                updatedBy: adminUser._id,
            },
            {
                title: 'דודו טסה',
                description: '<p>פותחים שנה בבארבי! מופע מיוחד של דודו טסה.</p>',
                dateISO: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                doorsTime: '20:30',
                status: 'sold_out',
                venueName: 'בארבי',
                venueAddress: 'קיבוץ גלויות 52, תל אביב',
                ticketTiers: [{ label: 'כניסה', price: 120, currency: 'ILS' }],
                tags: ['מזרחי', 'ישראלי'],
                featured: true,
                published: true,
                archived: false,
                createdBy: adminUser._id,
                updatedBy: adminUser._id,
            },
            {
                title: 'שלמה ארצי',
                description: '<p>ערב אינטימי עם שלמה ארצי ושירים אהובים.</p>',
                dateISO: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                doorsTime: '20:00',
                status: 'available',
                venueName: 'בארבי',
                venueAddress: 'קיבוץ גלויות 52, תל אביב',
                ticketTiers: [
                    { label: 'עמידה', price: 150, currency: 'ILS' },
                    { label: 'ישיבה', price: 200, currency: 'ILS' },
                ],
                tags: ['פופ', 'ישראלי'],
                featured: true,
                published: true,
                archived: false,
                createdBy: adminUser._id,
                updatedBy: adminUser._id,
            },
            {
                title: 'תל אביב חוזרת לניינטיז',
                description: '<p>מסיבת הניינטיז הכי גדולה בעיר! DJ סטים ואווירת שנות ה-90.</p>',
                dateISO: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
                doorsTime: '21:30',
                status: 'available',
                venueName: 'בארבי',
                venueAddress: 'קיבוץ גלויות 52, תל אביב',
                ticketTiers: [{ label: 'כניסה', price: 80, currency: 'ILS' }],
                tags: ['מסיבה', '90s'],
                featured: false,
                published: true,
                archived: false,
                createdBy: adminUser._id,
                updatedBy: adminUser._id,
            },
        ];

        const existingShowsCount = await Show.countDocuments();
        if (existingShowsCount === 0) {
            for (const showData of sampleShows) {
                await Show.create(showData);
                console.log(`   ✅ Created show: ${showData.title}`);
            }
        } else {
            console.log('   Shows already exist, skipping...');
        }

        console.log('\n✅ Database seed completed successfully!');
        console.log('\n📋 Login credentials:');
        console.log(`   Admin: ${config.admin.email} / ${config.admin.password}`);
        console.log('   Editor: editor@barby.co.il / editor123456\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();
