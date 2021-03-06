import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operators/map';
import {Router} from '@angular/router';
import {environment} from '../environments/environment';

export interface Profile {
  resumeType?: string;
  experience?: string;
  education?: string;
  locationHistory?: string;
  specificClient?: string;
  specificClientAvoid?: string;
}

export interface UserDetails {
  _id: string;
  email: string;
  first_name: string;
  last_name?: string;
  role?: string;
  visa?: string;
  study_course?: string;
  batch_number?: string;
  profile?: Profile;
  exp: number;
  iat: number;
}


interface TokenResponse {
  token: string;
}

export interface TokenPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  visa?: string;
  study_course?: string;
  batch_number?: string;
}

export class Resume {
  _id: string;
  userId?: string;
  student_resume?: string;
  cybertek_resume?: string;
  status = 'empty';
  student_comments?: string;
  admin_coments?: string;
  submitted_date?: string;
}

export class ProfileBean {
  _id = '';
  specificClientAvoid = '';
  specificClient = '';
  locationHistory = '';
  education = '';
  experience = '';
  resumeType = '';
}

export interface Student {
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  visa: string;
  batch_number: string;
  study_course: string;
  role?: string;
  profile?: ProfileBean;
  resume?: Resume;
  date?: Date;
}

@Injectable()
export class AuthenticationService {
  private token: string;
  public resume: Resume = new Resume();
  public student: Student;
  endpoint: string = environment.APIEndpoint;

  constructor(private http: HttpClient, private router: Router) {
  }

  public getResume() {
    return this.resume;
  }

  private saveToken(token: string): void {
    localStorage.setItem('mean-token', token);
    this.token = token;
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('mean-token');
    }
    return this.token;
  }

  public getUserDetails(): UserDetails {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  public isAdmin(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.role === 'admin';
    } else {
      return false;
    }
  }

  private request(method: 'post' | 'get', type: 'login' | 'register' | 'profile', user?: TokenPayload): Observable<any> {
    let base;

    if (method === 'post') {
      base = this.http.post(`${this.endpoint}/api/${type}`, user);
    } else {
      base = this.http.get(`${this.endpoint}/api/${type}`, {headers: {Authorization: `Bearer ${this.getToken()}`}});
    }

    const request = base.pipe(
      map((data: TokenResponse) => {
        if (data.token) {
          this.saveToken(data.token);
        }
        return data;
      })
    );

    return request;
  }

  public register(user: TokenPayload): Observable<any> {
    const resFlag = this.checkEmail(user.email);
    resFlag.pipe(map((str: Object) => {
      return str;
    }));

    return this.request('post', 'register', user);
  }

  public login(user: TokenPayload): Observable<any> {
    return this.request('post', 'login', user);
  }

  public profile(): Observable<any> {
    return this.request('get', 'profile');
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('mean-token');
    this.router.navigateByUrl('/');
    this.resume = new Resume();
    this.student = null;
  }

  private checkEmail(email: string): Observable<any> {
    const params = new HttpParams().set('scope', 'crmapi').set('selectColumns', 'contacts(Status)').set('searchColumn', 'email').set('searchValue', email);
    const responce = this.http.get('https://crm.zoho.com/crm/private/json/Contacts/getSearchRecordsByPDC', {params});
    return responce;
  }

  /**
   https://crm.zoho.com/crm/private/json/Contacts/getSearchRecordsByPDC?
   authtoken=32ecc7f456551465b0a2f91fa4b7f187&
   scope=crmapi&
   selectColumns=contacts(Status)&
   searchColumn=email&
   searchValue=sofia.rahimi@gmail.com
   **/

  public addProfile(profile: Profile): Observable<any> {
    const base = this.http.post(`${this.endpoint}/api/addProfile`, profile, {headers: {Authorization: `Bearer ${this.getToken()}`}});
    const request = base.pipe(
      map((data: Profile) => {
        return data;
      })
    );
    return request;
  }

  public getProfile(): Observable<Student> {
    const base = this.http.get(`${this.endpoint}/api/profile`, {headers: {Authorization: `Bearer ${this.getToken()}`}});
    const request = base.pipe(
      map((data: Student) => {
        // if(obj.resume !== undefined){
        //   this.resume = obj.resume;
        // }

        // console.log("Resume:"+obj.resume);
        this.student = data;
        console.log('Student: ' + this.student);
        return data;
      })
    );
    return request;
  }

  public getProfiles(): Observable<Student[]> {
    const base = this.http.get(`${this.endpoint}/api/get-all-profiles`, {headers: {Authorization: `Bearer ${this.getToken()}`}});
    const request = base.pipe(
      map((data: Student[]) => {
        const students: Student[] = data;
        return students;
      })
    );
    return request;
  }

  public deleteResume(student: Student): Observable<any> {
    const base = this.http.post(`${this.endpoint}/api/resubmit-resume`, student, {headers: {Authorization: `Bearer ${this.getToken()}`}});
    const request = base.pipe(
      map((data: Student) => {
        return data;
      })
    );
    return request;
  }

  public updateResume(resume: Resume): Observable<any> {
    const base = this.http.post(`${this.endpoint}/api/update-resume`, resume, {headers: {Authorization: `Bearer ${this.getToken()}`}});
    const request = base.pipe(
      map((res: Resume) => {
        return res;
      })
    );
    return request;
  }

}
