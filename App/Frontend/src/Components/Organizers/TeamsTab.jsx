import PropTypes, { func } from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, UserPlus, Eye, Crown, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { fetchTeamList } from '../../Store/team.slice';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/Components/ui/accordion';
import { Badge } from '@/Components/ui/badge';

export function TeamsTab({ onNavigate }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchTeamList());
    console.log('Team tab Fetched team list :', teamList);
  }, [dispatch]);

  const { teamList, loading } = useSelector((state) => state.team);
  const userTeams = teamList?.filter(team => {
    const isLeader = team.leader?._id === user.id;
    const isMember = team.members?.some(member => member.user?._id === user.id);
    return isLeader || isMember;
  }) || [];

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
        <p>Loading teams...</p>
      </div>
    );
  }

  if (userTeams.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>You are not part of any team yet</p>
        <p className="text-sm mt-2">Teams you create or join will appear here</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    if (status === 'Approved') {
      return <Badge variant="outline" className="text-success border-success/50 bg-success/10 gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
    }
    if (status === 'Rejected') {
      return <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/10 gap-1 text-xs"><XCircle className="w-3 h-3" /> Rejected</Badge>;
    }
    return <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10 gap-1 text-xs"><Clock className="w-3 h-3" /> Pending</Badge>;
  };

  const getRoleIcon = (role) => {
    if (role === 'leader') return <Crown className="w-4 h-4 text-secondary" />;
    if (role === 'co-organizer') return <Shield className="w-4 h-4 text-primary" />;
    return <Users className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {userTeams.map((team, index) => {
        const leaderName = team.leader?.profile?.name || team.leader?.username || 'N/A';
        const leaderEmail = team.leader?.email || 'N/A';
        const memberCount = team.members.length + 1; // +1 for leader
        console.log('Team members:', team);
        return (
          <Card
            key={team._id}
            className={`hover:shadow-lg hover:translate-y-[-2px] hover:scale-[1.01] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary icon-interact" />
                {team.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{team.description}</p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{memberCount} Members</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {/* Leader */}
                      <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderName}`} />
                            <AvatarFallback>{leaderName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{leaderName}</p>
                            <p className="text-xs text-muted-foreground">{leaderEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
                          <Crown className="w-4 h-4" />
                          Leader
                        </div>
                      </div>
                      {/* Members */}
                      {team.members.map(member => (
                        <div key={member.user._id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user.profile.name}`} />
                              <AvatarFallback>{member.user.profile.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.user.profile.name}</p>
                              <p className="text-xs text-muted-foreground">{member.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize">{member.role}</Badge>
                            {getStatusBadge(member.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

TeamsTab.propTypes = {
  onNavigate: PropTypes.func,
};