// Backend storage utility

import api from "./api";


// ---------- TYPES ----------

export interface User {

id:string;

username:string;

role:'admin'|'supervisor'|'accountant';

name:string;

}

export interface Worker {

id:string;

name:string;

contact:string;

role:string;

dailyWage:number;

assignedProject:string;

}

export interface Project {

id:string;

name:string;

location:string;

startDate:string;

endDate:string;

budget:number;

status:string;

assignedWorkers:string[];

}

export interface Material {

id:string;

name:string;

quantity:number;

unit:string;

costPerUnit:number;

projectUsed:string;

}

export interface AttendanceRecord {

id:string;

workerId:string;

date:string;

status:'P'|'A'|'H';

projectId:string;

}

export interface SalaryRecord {

id:string;

workerId:string;

month:string;

daysWorked:number;

bonus:number;

deduction:number;

finalSalary:number;

}


// ---------- ID ----------

export const generateId = ():string => {

return Date.now().toString();

};


// ---------- READ ----------

const routeMap: Record<string, string> = {
	workers: "labour",
	projects: "projects",
	attendance: "attendance",
	materials: "materials",
	salary: "salaries",
	salaries: "salaries",
};

export const getData = async <T>(key: string): Promise<T[]> => {
	const route = routeMap[key] || key;
	const res = await api.get(`/${route}`);
	// Normalize labour -> workers shape for frontend
	if (route === "labour") {
		const rows = res.data as any[];
		const mapped = (rows || []).map((r) => ({
			id: String(r.id),
			name: r.name || "",
			contact: r.contact || "",
			role: r.work || "",
			dailyWage: Number(r.salary || 0),
			assignedProject: r.assignedProject || "",
		})) as unknown as T[];
		return mapped;
	}

	return res.data;
};


// ---------- ADD ----------

export const addItem = async <T>(key: string, item: T) => {
	const route = routeMap[key] || key;
	// map worker shape to backend labour
	if (route === "labour") {
		const it: any = item as any;
		const payload = {
			name: it.name || "",
			work: it.role || it.work || "",
			salary: Number(it.dailyWage || it.salary || 0),
		};
		await api.post(`/${route}`, payload);
		return;
	}

	await api.post(`/${route}`, item);
};


// ---------- UPDATE ----------

export const updateItem = async <T extends { id: string }>(key: string, id: string, item: T) => {
	const route = routeMap[key] || key;
	if (route === "labour") {
		const it: any = item as any;
		const payload = {
			name: it.name || "",
			work: it.role || it.work || "",
			salary: Number(it.dailyWage || it.salary || 0),
		};
		await api.put(`/${route}/${id}`, payload);
		return;
	}
	await api.put(`/${route}/${id}`, item);
};


// ---------- DELETE ----------

export const deleteItem = async (key: string, id: string) => {
	const route = routeMap[key] || key;
	await api.delete(`/${route}/${id}`);
};


// ---------- LOGIN ----------

export const login = async(

username:string,

password:string

):Promise<User|null>=>{

try{

const res = await api.post(

"/users/login",

{

username,
password

}

);

if(res.data.success){

localStorage.setItem(

"user",

JSON.stringify(res.data.user)

);
    
			// store token for api interceptor
			if (res.data.token) {
				try { localStorage.setItem('token', res.data.token); } catch (e) {}
			}

return res.data.user;

}

return null;

}

catch{

return null;

}

};


// ---------- LOGOUT ----------

export const logout = ()=>{

localStorage.removeItem("user");
	try{ localStorage.removeItem('token'); }catch(e){}

};




// ---------- CURRENT USER ----------

export const getCurrentUser = ():User|null=>{

const user = localStorage.getItem("user");

return user ? JSON.parse(user) : null;

};


// ---------- INIT ----------

export const initializeData = ()=>{

console.log("Backend Storage Initialized");

};


// ---------- SAVE FULL ----------

export const setData = async <T>(key: string, data: T[]) => {
  const route = routeMap[key] || key;
	// Try bulk endpoint first
	try {
		if (route === 'labour') {
			const payload = (data as unknown as any[]).map((it) => ({
				name: it.name || '',
				contact: it.contact || '',
				role: it.role || it.work || '',
				dailyWage: Number(it.dailyWage || it.salary || 0),
				assignedProject: it.assignedProject || '',
			}));
			await api.post(`/${route}/bulk`, payload);
			return;
		}
		await api.post(`/${route}/bulk`, data);
		return;
	} catch (err: any) {
		// Fallback: some backends may not expose /bulk. Replace by deleting existing then adding items.
		if (err?.response?.status === 404) {
			// fetch existing
			const existing = await api.get(`/${route}`);
			const rows = existing.data || [];
			// delete all
			for (const r of rows) {
				try { await api.delete(`/${route}/${r.id}`); } catch (e) { /* ignore */ }
			}
			// insert each item
			if (route === 'labour') {
				for (const it of data as unknown as any[]) {
					await addItem('workers', it as any);
				}
			} else {
				for (const it of data as unknown as any[]) {
					await api.post(`/${route}`, it);
				}
			}
			return;
		}
		throw err;
	}
};