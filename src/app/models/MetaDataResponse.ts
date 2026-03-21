export interface MetaDataResponse {
  religions: string[];
  maritalStatuses: string[];
  languages: string[];
  countries: string[];
  states: string[];
  cities: string[];
  towns: string[];
  genders: string[];
  star: string[];
  rasi: string[];
  castes: string[];
  subCastes: string[];
}

export interface MetadataOption {
  id: number;
  name: string;
  code?: string;
  parentId?: number;
}
