/* مولَّد تلقائياً من apps-script/Schema.gs عبر tools/build-schema.js — لا تعدّله يدوياً */
window.UMRAH_SCHEMA = {
 "entities": {
  "users": {
   "label": "المستخدمون",
   "singular": "مستخدم",
   "id": "User_ID",
   "readOnly": true,
   "noDelete": false,
   "listColumns": [
    "Display_Name",
    "Email",
    "Role",
    "Status",
    "Last_Login_At"
   ],
   "fields": [
    {
     "name": "User_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Email",
     "type": "email",
     "label": "البريد الإلكتروني",
     "required": true
    },
    {
     "name": "Display_Name",
     "type": "string",
     "label": "الاسم",
     "required": true,
     "max": 100
    },
    {
     "name": "Role",
     "type": "enum",
     "label": "الدور",
     "required": true,
     "enumValues": [
      "company_admin",
      "supervisor",
      "sheikh",
      "accountant",
      "booking_agent",
      "transport_manager",
      "pilgrim"
     ],
     "enumLabels": {
      "company_admin": "مدير الشركة",
      "supervisor": "مشرف",
      "sheikh": "شيخ",
      "accountant": "محاسب",
      "booking_agent": "مسؤول حجوزات",
      "transport_manager": "مسؤول نقل",
      "pilgrim": "معتمر"
     }
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "enumValues": [
      "invited",
      "active",
      "disabled"
     ],
     "enumLabels": {
      "invited": "مدعو (لم يفعّل بعد)",
      "active": "نشط",
      "disabled": "معطّل"
     },
     "def": "invited"
    },
    {
     "name": "Phone",
     "type": "phone",
     "label": "الهاتف"
    },
    {
     "name": "Pilgrim_ID",
     "type": "ref",
     "label": "المعتمر المرتبط",
     "sys": true,
     "ref": "pilgrims"
    },
    {
     "name": "Last_Login_At",
     "type": "datetime",
     "label": "آخر دخول",
     "sys": true
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "pilgrims": {
   "label": "المعتمرون",
   "singular": "معتمر",
   "id": "Pilgrim_ID",
   "readOnly": false,
   "noDelete": false,
   "listColumns": [
    "Pilgrim_Code",
    "Full_Name",
    "Phone",
    "Campaign_ID",
    "Booking_Status",
    "Payment_Status"
   ],
   "fields": [
    {
     "name": "Pilgrim_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Pilgrim_Code",
     "type": "string",
     "label": "رمز المعتمر",
     "ro": true,
     "tier": "basic"
    },
    {
     "name": "Full_Name",
     "type": "string",
     "label": "الاسم الكامل",
     "required": true,
     "max": 120,
     "tier": "basic"
    },
    {
     "name": "Phone",
     "type": "phone",
     "label": "الهاتف",
     "tier": "contact"
    },
    {
     "name": "Email",
     "type": "email",
     "label": "البريد الإلكتروني",
     "tier": "contact"
    },
    {
     "name": "Nationality",
     "type": "string",
     "label": "الجنسية",
     "max": 60,
     "tier": "basic"
    },
    {
     "name": "Passport_Number",
     "type": "string",
     "label": "رقم الجواز",
     "max": 30,
     "tier": "sensitive"
    },
    {
     "name": "Passport_Expiry",
     "type": "date",
     "label": "انتهاء الجواز",
     "tier": "sensitive"
    },
    {
     "name": "Emergency_Contact",
     "type": "string",
     "label": "جهة اتصال الطوارئ",
     "max": 160,
     "tier": "contact"
    },
    {
     "name": "Campaign_ID",
     "type": "ref",
     "label": "الحملة",
     "ro": true,
     "ref": "campaigns",
     "tier": "basic"
    },
    {
     "name": "Booking_Status",
     "type": "enum",
     "label": "حالة الحجز",
     "enumValues": [
      "none",
      "pending",
      "confirmed",
      "cancelled",
      "completed"
     ],
     "enumLabels": {
      "none": "بلا حجز",
      "pending": "قيد التأكيد",
      "confirmed": "مؤكد",
      "cancelled": "ملغي",
      "completed": "مكتمل"
     },
     "ro": true,
     "def": "none",
     "tier": "basic"
    },
    {
     "name": "Payment_Status",
     "type": "enum",
     "label": "حالة التسديد",
     "enumValues": [
      "none",
      "unpaid",
      "partial",
      "paid",
      "overpaid"
     ],
     "enumLabels": {
      "none": "—",
      "unpaid": "غير مسدد",
      "partial": "مسدد جزئياً",
      "paid": "مسدد بالكامل",
      "overpaid": "زائد عن المستحق"
     },
     "ro": true,
     "def": "none",
     "tier": "finance"
    },
    {
     "name": "Makkah_Hotel",
     "type": "string",
     "label": "فندق مكة",
     "max": 120,
     "tier": "basic"
    },
    {
     "name": "Makkah_Room",
     "type": "string",
     "label": "غرفة مكة",
     "max": 30,
     "tier": "basic"
    },
    {
     "name": "Makkah_Location",
     "type": "string",
     "label": "موقع مكة",
     "max": 160,
     "tier": "basic"
    },
    {
     "name": "Makkah_Room_ID",
     "type": "ref",
     "label": "معرّف غرفة مكة",
     "ro": true,
     "ref": "rooms",
     "tier": "basic"
    },
    {
     "name": "Madinah_Hotel",
     "type": "string",
     "label": "فندق المدينة",
     "max": 120,
     "tier": "basic"
    },
    {
     "name": "Madinah_Room",
     "type": "string",
     "label": "غرفة المدينة",
     "max": 30,
     "tier": "basic"
    },
    {
     "name": "Madinah_Location",
     "type": "string",
     "label": "موقع المدينة",
     "max": 160,
     "tier": "basic"
    },
    {
     "name": "Madinah_Room_ID",
     "type": "ref",
     "label": "معرّف غرفة المدينة",
     "ro": true,
     "ref": "rooms",
     "tier": "basic"
    },
    {
     "name": "Notes",
     "type": "text",
     "label": "ملاحظات",
     "max": 1500,
     "tier": "contact"
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "campaigns": {
   "label": "الحملات",
   "singular": "حملة",
   "id": "Campaign_ID",
   "readOnly": false,
   "noDelete": false,
   "listColumns": [
    "Campaign_Name",
    "Start_Date",
    "End_Date",
    "Capacity",
    "Available_Spaces",
    "Price",
    "Status"
   ],
   "fields": [
    {
     "name": "Campaign_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Campaign_Name",
     "type": "string",
     "label": "اسم الحملة",
     "required": true,
     "max": 120
    },
    {
     "name": "Start_Date",
     "type": "date",
     "label": "تاريخ البداية",
     "required": true
    },
    {
     "name": "End_Date",
     "type": "date",
     "label": "تاريخ النهاية",
     "required": true
    },
    {
     "name": "Departure_City",
     "type": "string",
     "label": "مدينة المغادرة",
     "max": 80
    },
    {
     "name": "Return_City",
     "type": "string",
     "label": "مدينة العودة",
     "max": 80
    },
    {
     "name": "Capacity",
     "type": "int",
     "label": "الطاقة الاستيعابية",
     "required": true,
     "min": 1
    },
    {
     "name": "Available_Spaces",
     "type": "int",
     "label": "الأماكن المتاحة",
     "ro": true
    },
    {
     "name": "Price",
     "type": "money",
     "label": "السعر للفرد",
     "required": true
    },
    {
     "name": "Currency",
     "type": "string",
     "label": "العملة",
     "required": true,
     "max": 5,
     "def": "SAR"
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "enumValues": [
      "draft",
      "open",
      "full",
      "closed",
      "completed",
      "cancelled"
     ],
     "enumLabels": {
      "draft": "مسودة",
      "open": "مفتوحة للحجز",
      "full": "مكتملة العدد",
      "closed": "مغلقة",
      "completed": "منتهية",
      "cancelled": "ملغاة"
     },
     "def": "draft"
    },
    {
     "name": "Supervisors",
     "type": "csv",
     "label": "المشرفون (بريدهم)",
     "max": 600
    },
    {
     "name": "Notes",
     "type": "text",
     "label": "ملاحظات",
     "max": 1500
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "bookings": {
   "label": "الحجوزات",
   "singular": "حجز",
   "id": "Booking_ID",
   "readOnly": false,
   "noDelete": false,
   "listColumns": [
    "Booking_No",
    "Pilgrim_ID",
    "Campaign_ID",
    "Booking_Date",
    "Status",
    "Total_Price"
   ],
   "fields": [
    {
     "name": "Booking_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Booking_No",
     "type": "string",
     "label": "رقم الحجز",
     "ro": true
    },
    {
     "name": "Pilgrim_ID",
     "type": "ref",
     "label": "المعتمر",
     "required": true,
     "ref": "pilgrims",
     "createOnly": true
    },
    {
     "name": "Campaign_ID",
     "type": "ref",
     "label": "الحملة",
     "required": true,
     "ref": "campaigns",
     "createOnly": true
    },
    {
     "name": "Booking_Date",
     "type": "date",
     "label": "تاريخ الحجز"
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "enumValues": [
      "pending",
      "confirmed",
      "cancelled",
      "completed"
     ],
     "enumLabels": {
      "pending": "قيد التأكيد",
      "confirmed": "مؤكد",
      "cancelled": "ملغي",
      "completed": "مكتمل"
     },
     "def": "pending"
    },
    {
     "name": "Total_Price",
     "type": "money",
     "label": "السعر الإجمالي"
    },
    {
     "name": "Currency",
     "type": "string",
     "label": "العملة",
     "max": 5,
     "ro": true
    },
    {
     "name": "Notes",
     "type": "text",
     "label": "ملاحظات",
     "max": 1000
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "payments": {
   "label": "الدفعات",
   "singular": "دفعة",
   "id": "Payment_ID",
   "readOnly": false,
   "noDelete": true,
   "listColumns": [
    "Payment_Date",
    "Pilgrim_ID",
    "Booking_ID",
    "Amount",
    "Currency",
    "Payment_Method",
    "Status"
   ],
   "fields": [
    {
     "name": "Payment_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Pilgrim_ID",
     "type": "ref",
     "label": "المعتمر",
     "ro": true,
     "ref": "pilgrims"
    },
    {
     "name": "Booking_ID",
     "type": "ref",
     "label": "الحجز",
     "required": true,
     "ref": "bookings",
     "createOnly": true
    },
    {
     "name": "Amount",
     "type": "money",
     "label": "المبلغ",
     "required": true,
     "min": 0.01,
     "createOnly": true
    },
    {
     "name": "Currency",
     "type": "string",
     "label": "العملة",
     "max": 5,
     "ro": true
    },
    {
     "name": "Payment_Date",
     "type": "date",
     "label": "تاريخ الدفعة",
     "required": true
    },
    {
     "name": "Payment_Method",
     "type": "enum",
     "label": "طريقة الدفع",
     "required": true,
     "enumValues": [
      "cash",
      "bank_transfer",
      "card_manual",
      "cheque",
      "other"
     ],
     "enumLabels": {
      "cash": "نقداً",
      "bank_transfer": "حوالة بنكية",
      "card_manual": "بطاقة (تسجيل يدوي)",
      "cheque": "شيك",
      "other": "أخرى"
     }
    },
    {
     "name": "Reference_Number",
     "type": "string",
     "label": "رقم المرجع/الإيصال",
     "max": 60
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "enumValues": [
      "recorded",
      "void"
     ],
     "enumLabels": {
      "recorded": "مسجَّلة",
      "void": "ملغاة"
     },
     "ro": true,
     "def": "recorded"
    },
    {
     "name": "Void_Reason",
     "type": "string",
     "label": "سبب الإلغاء",
     "max": 200,
     "ro": true
    },
    {
     "name": "Recorded_By",
     "type": "email",
     "label": "سُجِّلت بواسطة",
     "sys": true
    },
    {
     "name": "Notes",
     "type": "text",
     "label": "ملاحظات",
     "max": 500
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "expenses": {
   "label": "المصاريف",
   "singular": "مصروف",
   "id": "Expense_ID",
   "readOnly": false,
   "noDelete": true,
   "listColumns": [
    "Expense_Date",
    "Campaign_ID",
    "Category",
    "Amount",
    "Currency",
    "Description",
    "Status"
   ],
   "fields": [
    {
     "name": "Expense_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Campaign_ID",
     "type": "ref",
     "label": "الحملة",
     "ref": "campaigns"
    },
    {
     "name": "Category",
     "type": "string",
     "label": "التصنيف",
     "required": true,
     "max": 60
    },
    {
     "name": "Amount",
     "type": "money",
     "label": "المبلغ",
     "required": true,
     "min": 0.01
    },
    {
     "name": "Currency",
     "type": "string",
     "label": "العملة",
     "required": true,
     "max": 5,
     "def": "SAR"
    },
    {
     "name": "Expense_Date",
     "type": "date",
     "label": "تاريخ المصروف",
     "required": true
    },
    {
     "name": "Description",
     "type": "string",
     "label": "الوصف",
     "max": 300
    },
    {
     "name": "Recorded_By",
     "type": "email",
     "label": "سُجِّل بواسطة",
     "sys": true
    },
    {
     "name": "Attachment_Reference",
     "type": "string",
     "label": "مرجع المرفق",
     "max": 200
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "enumValues": [
      "recorded",
      "void"
     ],
     "enumLabels": {
      "recorded": "مسجَّلة",
      "void": "ملغاة"
     },
     "ro": true,
     "def": "recorded"
    },
    {
     "name": "Void_Reason",
     "type": "string",
     "label": "سبب الإلغاء",
     "max": 200,
     "ro": true
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "hotels": {
   "label": "الفنادق",
   "singular": "فندق",
   "id": "Hotel_ID",
   "readOnly": false,
   "noDelete": false,
   "listColumns": [
    "Hotel_Name",
    "City",
    "Address",
    "Contact_Phone"
   ],
   "fields": [
    {
     "name": "Hotel_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Hotel_Name",
     "type": "string",
     "label": "اسم الفندق",
     "required": true,
     "max": 120
    },
    {
     "name": "City",
     "type": "enum",
     "label": "المدينة",
     "required": true,
     "enumValues": [
      "makkah",
      "madinah",
      "other"
     ],
     "enumLabels": {
      "makkah": "مكة المكرمة",
      "madinah": "المدينة المنورة",
      "other": "أخرى"
     }
    },
    {
     "name": "Address",
     "type": "string",
     "label": "العنوان",
     "max": 250
    },
    {
     "name": "Contact_Phone",
     "type": "phone",
     "label": "هاتف التواصل"
    },
    {
     "name": "Notes",
     "type": "text",
     "label": "ملاحظات",
     "max": 800
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "rooms": {
   "label": "الغرف",
   "singular": "غرفة",
   "id": "Room_ID",
   "readOnly": false,
   "noDelete": false,
   "listColumns": [
    "Hotel_ID",
    "Room_Number",
    "Capacity",
    "Occupied_Beds",
    "Status"
   ],
   "fields": [
    {
     "name": "Room_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Hotel_ID",
     "type": "ref",
     "label": "الفندق",
     "required": true,
     "ref": "hotels",
     "createOnly": true
    },
    {
     "name": "Room_Number",
     "type": "string",
     "label": "رقم الغرفة",
     "required": true,
     "max": 20
    },
    {
     "name": "Capacity",
     "type": "int",
     "label": "عدد الأسرّة",
     "required": true,
     "min": 1
    },
    {
     "name": "Occupied_Beds",
     "type": "int",
     "label": "المشغول",
     "ro": true
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "enumValues": [
      "available",
      "full",
      "maintenance"
     ],
     "enumLabels": {
      "available": "متاحة",
      "full": "مكتملة",
      "maintenance": "صيانة"
     },
     "def": "available"
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "vehicles": {
   "label": "المركبات",
   "singular": "مركبة",
   "id": "Vehicle_ID",
   "readOnly": false,
   "noDelete": false,
   "listColumns": [
    "Vehicle_Type",
    "Vehicle_Number",
    "Capacity",
    "Driver_Name",
    "Driver_Phone",
    "Status"
   ],
   "fields": [
    {
     "name": "Vehicle_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Vehicle_Type",
     "type": "string",
     "label": "نوع المركبة",
     "required": true,
     "max": 60
    },
    {
     "name": "Vehicle_Number",
     "type": "string",
     "label": "رقم اللوحة",
     "required": true,
     "max": 30
    },
    {
     "name": "Capacity",
     "type": "int",
     "label": "عدد المقاعد",
     "required": true,
     "min": 1
    },
    {
     "name": "Driver_Name",
     "type": "string",
     "label": "اسم السائق",
     "max": 100
    },
    {
     "name": "Driver_Phone",
     "type": "phone",
     "label": "هاتف السائق"
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "enumValues": [
      "active",
      "maintenance",
      "inactive"
     ],
     "enumLabels": {
      "active": "تعمل",
      "maintenance": "صيانة",
      "inactive": "متوقفة"
     },
     "def": "active"
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "transport": {
   "label": "رحلات النقل",
   "singular": "رحلة نقل",
   "id": "Transport_ID",
   "readOnly": false,
   "noDelete": false,
   "listColumns": [
    "Departure_Time",
    "Vehicle_ID",
    "Departure_Location",
    "Destination",
    "Status"
   ],
   "fields": [
    {
     "name": "Transport_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Campaign_ID",
     "type": "ref",
     "label": "الحملة",
     "ref": "campaigns"
    },
    {
     "name": "Vehicle_ID",
     "type": "ref",
     "label": "المركبة",
     "required": true,
     "ref": "vehicles"
    },
    {
     "name": "Departure_Time",
     "type": "datetime",
     "label": "وقت الانطلاق",
     "required": true
    },
    {
     "name": "Departure_Location",
     "type": "string",
     "label": "مكان الانطلاق",
     "required": true,
     "max": 160
    },
    {
     "name": "Destination",
     "type": "string",
     "label": "الوجهة",
     "required": true,
     "max": 160
    },
    {
     "name": "Meeting_Point",
     "type": "string",
     "label": "نقطة التجمع",
     "max": 160
    },
    {
     "name": "Passenger_IDs",
     "type": "csv",
     "label": "الركاب",
     "max": 12000,
     "ro": true
    },
    {
     "name": "Notes",
     "type": "text",
     "label": "ملاحظات",
     "max": 800
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "enumValues": [
      "scheduled",
      "in_progress",
      "completed",
      "cancelled"
     ],
     "enumLabels": {
      "scheduled": "مجدولة",
      "in_progress": "جارية",
      "completed": "منتهية",
      "cancelled": "ملغاة"
     },
     "def": "scheduled"
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "schedule": {
   "label": "البرنامج والمواعيد",
   "singular": "موعد",
   "id": "Schedule_ID",
   "readOnly": false,
   "noDelete": false,
   "listColumns": [
    "Date_Time",
    "Title",
    "Category",
    "Location",
    "Status"
   ],
   "fields": [
    {
     "name": "Schedule_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Campaign_ID",
     "type": "ref",
     "label": "الحملة (فارغ = لكل الحملات)",
     "ref": "campaigns"
    },
    {
     "name": "Title",
     "type": "string",
     "label": "العنوان",
     "required": true,
     "max": 150
    },
    {
     "name": "Category",
     "type": "enum",
     "label": "التصنيف",
     "required": true,
     "enumValues": [
      "tahajjud",
      "gathering",
      "ihram",
      "umrah",
      "lesson",
      "visit",
      "transport",
      "departure",
      "return",
      "general"
     ],
     "enumLabels": {
      "tahajjud": "صلاة التهجد",
      "gathering": "تجمع",
      "ihram": "إحرام",
      "umrah": "أداء العمرة",
      "lesson": "درس ديني",
      "visit": "زيارة",
      "transport": "نقل",
      "departure": "مغادرة",
      "return": "عودة",
      "general": "موعد عام"
     },
     "def": "general"
    },
    {
     "name": "Date_Time",
     "type": "datetime",
     "label": "وقت البداية",
     "required": true
    },
    {
     "name": "End_Time",
     "type": "datetime",
     "label": "وقت النهاية"
    },
    {
     "name": "Location",
     "type": "string",
     "label": "المكان",
     "max": 160
    },
    {
     "name": "Notes",
     "type": "text",
     "label": "ملاحظات",
     "max": 800
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "enumValues": [
      "active",
      "cancelled"
     ],
     "enumLabels": {
      "active": "قائم",
      "cancelled": "ملغى"
     },
     "def": "active"
    },
    {
     "name": "Important",
     "type": "bool",
     "label": "موعد مهم (إشعار تيليجرام)",
     "def": false
    },
    {
     "name": "Notify_Before_Min",
     "type": "int",
     "label": "التنبيه قبل (دقيقة)",
     "max": 1440,
     "min": 0,
     "def": 30
    },
    {
     "name": "Notified_At",
     "type": "datetime",
     "label": "وقت إرسال التنبيه",
     "sys": true
    },
    {
     "name": "Created_By",
     "type": "email",
     "label": "أنشأه",
     "sys": true
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "announcements": {
   "label": "الإعلانات",
   "singular": "إعلان",
   "id": "Announcement_ID",
   "readOnly": false,
   "noDelete": false,
   "listColumns": [
    "Title",
    "Priority",
    "Audience",
    "Start_Date",
    "End_Date",
    "Status"
   ],
   "fields": [
    {
     "name": "Announcement_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Campaign_ID",
     "type": "ref",
     "label": "الحملة (اختياري)",
     "ref": "campaigns"
    },
    {
     "name": "Title",
     "type": "string",
     "label": "العنوان",
     "required": true,
     "max": 150
    },
    {
     "name": "Message",
     "type": "text",
     "label": "نص الإعلان",
     "required": true,
     "max": 2000
    },
    {
     "name": "Priority",
     "type": "enum",
     "label": "الأولوية",
     "enumValues": [
      "normal",
      "high",
      "urgent"
     ],
     "enumLabels": {
      "normal": "عادي",
      "high": "مهم",
      "urgent": "عاجل"
     },
     "def": "normal"
    },
    {
     "name": "Audience",
     "type": "enum",
     "label": "الجمهور",
     "enumValues": [
      "all",
      "pilgrims",
      "staff"
     ],
     "enumLabels": {
      "all": "الجميع",
      "pilgrims": "المعتمرون",
      "staff": "الموظفون"
     },
     "def": "all"
    },
    {
     "name": "Start_Date",
     "type": "date",
     "label": "يبدأ"
    },
    {
     "name": "End_Date",
     "type": "date",
     "label": "ينتهي"
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "enumValues": [
      "draft",
      "pending_approval",
      "published",
      "paused"
     ],
     "enumLabels": {
      "draft": "مسودة",
      "pending_approval": "بانتظار الموافقة",
      "published": "منشور",
      "paused": "موقوف"
     },
     "def": "draft"
    },
    {
     "name": "Notified_At",
     "type": "datetime",
     "label": "وقت إشعار تيليجرام",
     "sys": true
    },
    {
     "name": "Created_By",
     "type": "email",
     "label": "أنشأه",
     "sys": true
    },
    {
     "name": "Approved_By",
     "type": "email",
     "label": "اعتمده",
     "sys": true
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "inquiries": {
   "label": "طلبات المساعدة",
   "singular": "طلب مساعدة",
   "id": "Inquiry_ID",
   "readOnly": false,
   "noDelete": false,
   "listColumns": [
    "Created_At",
    "Name",
    "Message",
    "Priority",
    "Status",
    "Assigned_To"
   ],
   "fields": [
    {
     "name": "Inquiry_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Pilgrim_ID",
     "type": "ref",
     "label": "المعتمر",
     "sys": true,
     "ref": "pilgrims"
    },
    {
     "name": "Name",
     "type": "string",
     "label": "الاسم",
     "required": true,
     "max": 120
    },
    {
     "name": "Phone",
     "type": "phone",
     "label": "الهاتف"
    },
    {
     "name": "Message",
     "type": "text",
     "label": "الرسالة",
     "required": true,
     "max": 1500,
     "min": 3
    },
    {
     "name": "Priority",
     "type": "enum",
     "label": "الأولوية",
     "enumValues": [
      "low",
      "normal",
      "high"
     ],
     "enumLabels": {
      "low": "منخفضة",
      "normal": "عادية",
      "high": "عالية"
     },
     "def": "normal"
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "enumValues": [
      "new",
      "in_progress",
      "waiting",
      "closed"
     ],
     "enumLabels": {
      "new": "جديد",
      "in_progress": "قيد المعالجة",
      "waiting": "بانتظار الرد",
      "closed": "مغلق"
     },
     "def": "new"
    },
    {
     "name": "Assigned_To",
     "type": "email",
     "label": "مُسند إلى"
    },
    {
     "name": "Response",
     "type": "text",
     "label": "الرد",
     "max": 1500
    },
    {
     "name": "Responded_By",
     "type": "email",
     "label": "ردّ بواسطة",
     "sys": true
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "ratings": {
   "label": "التقييمات",
   "singular": "تقييم",
   "id": "Rating_ID",
   "readOnly": false,
   "noDelete": true,
   "listColumns": [
    "Created_At",
    "Campaign_ID",
    "Rating",
    "Comment",
    "Status"
   ],
   "fields": [
    {
     "name": "Rating_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Pilgrim_ID",
     "type": "ref",
     "label": "المعتمر",
     "sys": true,
     "ref": "pilgrims"
    },
    {
     "name": "Campaign_ID",
     "type": "ref",
     "label": "الحملة",
     "sys": true,
     "ref": "campaigns"
    },
    {
     "name": "Rating",
     "type": "int",
     "label": "التقييم",
     "required": true,
     "max": 5,
     "min": 1
    },
    {
     "name": "Comment",
     "type": "text",
     "label": "التعليق",
     "max": 1000
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "enumValues": [
      "published",
      "hidden"
     ],
     "enumLabels": {
      "published": "منشور",
      "hidden": "مخفي"
     },
     "def": "published"
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "attendance": {
   "label": "الحضور",
   "singular": "سجل حضور",
   "id": "Attendance_ID",
   "readOnly": true,
   "noDelete": false,
   "listColumns": [
    "Schedule_ID",
    "Pilgrim_ID",
    "Status",
    "Recorded_By"
   ],
   "fields": [
    {
     "name": "Attendance_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Campaign_ID",
     "type": "ref",
     "label": "الحملة",
     "sys": true,
     "ref": "campaigns"
    },
    {
     "name": "Schedule_ID",
     "type": "ref",
     "label": "النشاط",
     "required": true,
     "ref": "schedule"
    },
    {
     "name": "Pilgrim_ID",
     "type": "ref",
     "label": "المعتمر",
     "required": true,
     "ref": "pilgrims"
    },
    {
     "name": "Status",
     "type": "enum",
     "label": "الحالة",
     "required": true,
     "enumValues": [
      "present",
      "absent",
      "late",
      "excused"
     ],
     "enumLabels": {
      "present": "حاضر",
      "absent": "غائب",
      "late": "متأخر",
      "excused": "معذور"
     }
    },
    {
     "name": "Note",
     "type": "string",
     "label": "ملاحظة",
     "max": 200
    },
    {
     "name": "Recorded_By",
     "type": "email",
     "label": "سُجِّل بواسطة",
     "sys": true
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  },
  "supervisor_reports": {
   "label": "تقارير المشرفين",
   "singular": "تقرير",
   "id": "Report_ID",
   "readOnly": false,
   "noDelete": false,
   "listColumns": [
    "Created_At",
    "Type",
    "Title",
    "Campaign_ID",
    "Created_By"
   ],
   "fields": [
    {
     "name": "Report_ID",
     "type": "id",
     "label": "المعرّف",
     "sys": true
    },
    {
     "name": "Campaign_ID",
     "type": "ref",
     "label": "الحملة",
     "required": true,
     "ref": "campaigns"
    },
    {
     "name": "Pilgrim_ID",
     "type": "ref",
     "label": "المعتمر (اختياري)",
     "ref": "pilgrims"
    },
    {
     "name": "Type",
     "type": "enum",
     "label": "النوع",
     "required": true,
     "enumValues": [
      "note",
      "report",
      "incident"
     ],
     "enumLabels": {
      "note": "ملاحظة",
      "report": "تقرير",
      "incident": "حادثة/بلاغ"
     },
     "def": "note"
    },
    {
     "name": "Title",
     "type": "string",
     "label": "العنوان",
     "required": true,
     "max": 150
    },
    {
     "name": "Body",
     "type": "text",
     "label": "التفاصيل",
     "required": true,
     "max": 3000
    },
    {
     "name": "Created_By",
     "type": "email",
     "label": "كتبه",
     "sys": true
    },
    {
     "name": "Created_At",
     "type": "datetime",
     "label": "تاريخ الإنشاء",
     "sys": true
    },
    {
     "name": "Updated_At",
     "type": "datetime",
     "label": "آخر تعديل",
     "sys": true
    }
   ]
  }
 },
 "enums": {
  "payMethod": {
   "values": [
    "cash",
    "bank_transfer",
    "card_manual",
    "cheque",
    "other"
   ],
   "labels": {
    "cash": "نقداً",
    "bank_transfer": "حوالة بنكية",
    "card_manual": "بطاقة (تسجيل يدوي)",
    "cheque": "شيك",
    "other": "أخرى"
   }
  },
  "scheduleCategory": {
   "values": [
    "tahajjud",
    "gathering",
    "ihram",
    "umrah",
    "lesson",
    "visit",
    "transport",
    "departure",
    "return",
    "general"
   ],
   "labels": {
    "tahajjud": "صلاة التهجد",
    "gathering": "تجمع",
    "ihram": "إحرام",
    "umrah": "أداء العمرة",
    "lesson": "درس ديني",
    "visit": "زيارة",
    "transport": "نقل",
    "departure": "مغادرة",
    "return": "عودة",
    "general": "موعد عام"
   }
  },
  "attendance": {
   "values": [
    "present",
    "absent",
    "late",
    "excused"
   ],
   "labels": {
    "present": "حاضر",
    "absent": "غائب",
    "late": "متأخر",
    "excused": "معذور"
   }
  },
  "inquiryStatus": {
   "values": [
    "new",
    "in_progress",
    "waiting",
    "closed"
   ],
   "labels": {
    "new": "جديد",
    "in_progress": "قيد المعالجة",
    "waiting": "بانتظار الرد",
    "closed": "مغلق"
   }
  }
 },
 "roles": {
  "super_admin": "مالك المنصة",
  "company_admin": "مدير الشركة",
  "supervisor": "مشرف",
  "sheikh": "شيخ",
  "accountant": "محاسب",
  "booking_agent": "مسؤول حجوزات",
  "transport_manager": "مسؤول نقل",
  "pilgrim": "معتمر"
 },
 "telegram_events": {
  "user.new": {
   "label": "مستخدم جديد",
   "def": false
  },
  "pilgrim.new": {
   "label": "معتمر جديد",
   "def": true
  },
  "booking.new": {
   "label": "حجز جديد",
   "def": true
  },
  "payment.new": {
   "label": "تسجيل دفعة",
   "def": true
  },
  "inquiry.new": {
   "label": "طلب مساعدة جديد",
   "def": true
  },
  "rating.new": {
   "label": "تقييم جديد",
   "def": true
  },
  "announcement.new": {
   "label": "إعلان جديد",
   "def": true
  },
  "schedule.important": {
   "label": "موعد مهم",
   "def": true
  },
  "system.error": {
   "label": "خطأ مهم",
   "def": true
  }
 }
};
