
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Check, X, Crown } from 'lucide-react';

interface User {
  id: string;
  name: string;
  isHost: boolean;
  isAdmitted: boolean;
}

interface UsersListProps {
  users: User[];
  currentUser: User;
  isHost: boolean;
  onAdmitUser: (userId: string) => void;
  onRejectUser: (userId: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
  currentUser,
  isHost,
  onAdmitUser,
  onRejectUser
}) => {
  const admittedUsers = users.filter(user => user.isAdmitted);
  const pendingUsers = users.filter(user => !user.isAdmitted);

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 rounded-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants ({admittedUsers.length + 1})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-64 overflow-y-auto">
        {/* Current User */}
        <div className="flex items-center gap-3 p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="text-white font-medium">{currentUser.name} (You)</div>
            {currentUser.isHost && (
              <div className="flex items-center gap-1 text-yellow-400 text-xs">
                <Crown className="w-3 h-3" />
                Host
              </div>
            )}
          </div>
        </div>

        {/* Admitted Users */}
        {admittedUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3 p-2 bg-green-500/20 rounded-lg border border-green-400/30">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">{user.name}</div>
              {user.isHost && (
                <div className="flex items-center gap-1 text-yellow-400 text-xs">
                  <Crown className="w-3 h-3" />
                  Host
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Pending Users (only visible to host) */}
        {isHost && pendingUsers.length > 0 && (
          <>
            <div className="border-t border-white/20 pt-3">
              <h4 className="text-white font-medium text-sm mb-2">Waiting for admission</h4>
            </div>
            {pendingUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-yellow-400 text-xs">Waiting...</div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    className="h-7 w-7 bg-green-600 hover:bg-green-700"
                    onClick={() => onAdmitUser(user.id)}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7"
                    onClick={() => onRejectUser(user.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersList;
