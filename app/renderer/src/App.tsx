import { useState } from 'react';
import { View } from 'react-big-calendar';
import { Sidebar } from './components/Sidebar';
import { ListView } from './pages/ListView';
import { CalendarView } from './pages/CalendarView';
import { StatsView } from './pages/StatsView';
import { SettingsView } from './pages/SettingsView';
import { TaskEditor } from './components/TaskEditor';
import { ListEditor } from './components/ListEditor';
import { NotificationManager } from './components/NotificationManager';
import { useAppStore } from './store/useAppStore';

function App() {
  const { currentView } = useAppStore();
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isListEditorOpen, setIsListEditorOpen] = useState(false);
  const [editingList, setEditingList] = useState<any>(null);
  const [calendarView, setCalendarView] = useState<View>('month');
  const [calendarDate, setCalendarDate] = useState(new Date());

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return <ListView onEditTask={(task) => {
          setEditingTask(task);
          setIsTaskEditorOpen(true);
        }} />;
      case 'calendar':
        return <CalendarView 
          onEditTask={(task) => {
            setEditingTask(task);
            setIsTaskEditorOpen(true);
          }}
          view={calendarView}
          date={calendarDate}
          onNavigate={setCalendarDate}
          onView={setCalendarView}
        />;
      case 'stats':
        return <StatsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ListView onEditTask={(task) => {
          setEditingTask(task);
          setIsTaskEditorOpen(true);
        }} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <Sidebar 
        onNewList={() => {
          setEditingList(null);
          setIsListEditorOpen(true);
        }}
        onEditList={(list) => {
          setEditingList(list);
          setIsListEditorOpen(true);
        }}
      />
      
      {/* 主内容区 */}
      <main className="flex-1 flex flex-col">
        {/* 顶部导航栏 */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                {currentView === 'list' && '任务清单'}
                {currentView === 'calendar' && '日历视图'}
                {currentView === 'stats' && '统计总结'}
                {currentView === 'settings' && '设置'}
              </h1>
              
              {currentView === 'calendar' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCalendarView('month')}
                    className={`px-3 py-1 rounded text-sm ${
                      calendarView === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    月视图
                  </button>
                  <button
                    onClick={() => setCalendarView('week')}
                    className={`px-3 py-1 rounded text-sm ${
                      calendarView === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    周视图
                  </button>
                  <button
                    onClick={() => setCalendarView('day')}
                    className={`px-3 py-1 rounded text-sm ${
                      calendarView === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    日视图
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <NotificationManager onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskEditorOpen(true);
              }} />
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskEditorOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + 新建任务
              </button>
            </div>
          </div>
        </header>
        
        {/* 视图内容 */}
        <div className="flex-1">
          {renderView()}
        </div>
      </main>
      
      {/* 任务编辑器模态框 */}
      {isTaskEditorOpen && (
        <TaskEditor
           isOpen={isTaskEditorOpen}
           task={editingTask}
           onClose={() => {
             setIsTaskEditorOpen(false);
             setEditingTask(null);
           }}
         />
      )}
      
      <ListEditor
        isOpen={isListEditorOpen}
        onClose={() => {
          setIsListEditorOpen(false);
          setEditingList(null);
        }}
        list={editingList}
      />
    </div>
  );
}

export default App;