import { Injectable } from '@angular/core';

type StorageType = 'local' | 'session';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  private getStorage(type: StorageType): Storage {
    return type === 'local' ? localStorage : sessionStorage;
  }

  set<T>(key: string, value: T, type: StorageType = 'local'): void {
    try {
      const storage = this.getStorage(type);
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to ${type}Storage:`, error);
    }
  }

  get<T>(key: string): T | null {
    try {
      // Coba dari localStorage dulu, lalu sessionStorage
      let item = localStorage.getItem(key);
      if (!item) {
        item = sessionStorage.getItem(key);
      }
      
      if (item) {
        return JSON.parse(item) as T;
      }
      return null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }

  clear(type?: StorageType): void {
    try {
      if (type) {
        this.getStorage(type).clear();
      } else {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  has(key: string): boolean {
    return localStorage.getItem(key) !== null || sessionStorage.getItem(key) !== null;
  }
}
