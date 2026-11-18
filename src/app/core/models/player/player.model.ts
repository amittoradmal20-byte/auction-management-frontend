
export interface Player {
  id: string;

  firstName: string;
  lastName: string;
  displayName: string;

  dateOfBirth: string;
  nationality: string;
  profileImageUrl: string | null;

  role: string;
  battingStyle: string | null;
  bowlingStyle: string | null;
  status: string;

  createdAt: string;
  updatedAt: string;
}
