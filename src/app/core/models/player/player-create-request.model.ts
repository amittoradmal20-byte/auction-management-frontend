
export interface PlayerCreateRequest {
  firstName: string;
  lastName: string | null;
  displayName: string;
  dateOfBirth: string | null;
  nationality: string | null;
  profileImageUrl: string | null;
  role: string;
  battingStyle: string;
  bowlingStyle: string;
}
