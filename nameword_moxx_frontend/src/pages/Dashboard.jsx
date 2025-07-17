import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { domainAPI } from '../api/domains';
import { paymentAPI } from '../api/payments';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [domains, setDomains] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load domains
      const domainsData = await domainAPI.getDomainList();
      setDomains(domainsData.data || []);

      // Load wallet balance
      const walletData = await paymentAPI.getWalletBalance();
      setWalletBalance(walletData.balance || 0);

      // Load transactions
      const transactionsData = await paymentAPI.getTransactions();
      setTransactions(transactionsData.data || []);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary dark:text-white mb-4">
            Please sign in to access your dashboard
          </h2>
          <a href="/sign-in" className="btn-blue">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-darkbtn"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="px-5 mb-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary dark:text-white mb-2">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-secondary dark:text-gray-400">
              Manage your domains, wallet, and account settings
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary dark:text-white mb-2">
                Total Domains
              </h3>
              <p className="text-3xl font-bold text-darkbtn dark:text-white">
                {domains.length}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary dark:text-white mb-2">
                Wallet Balance
              </h3>
              <p className="text-3xl font-bold text-tealdark">
                ${walletBalance.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-primary dark:text-white mb-2">
                Recent Transactions
              </h3>
              <p className="text-3xl font-bold text-darkbtn dark:text-white">
                {transactions.length}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'domains', label: 'My Domains' },
                  { id: 'wallet', label: 'Wallet' },
                  { id: 'transactions', label: 'Transactions' },
                  { id: 'profile', label: 'Profile' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-darkbtn text-darkbtn dark:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-primary dark:text-white mb-4">
                    Quick Overview
                  </h2>
                  
                  {/* Recent Domains */}
                  <div>
                    <h3 className="text-lg font-medium text-primary dark:text-white mb-3">
                      Recent Domains
                    </h3>
                    {domains.length > 0 ? (
                      <div className="space-y-2">
                        {domains.slice(0, 3).map((domain, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <span className="text-primary dark:text-white font-medium">
                              {domain.name}
                            </span>
                            <span className="text-sm text-secondary dark:text-gray-400">
                              {domain.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-secondary dark:text-gray-400">
                        No domains found. <a href="/" className="text-darkbtn hover:underline">Register your first domain</a>
                      </p>
                    )}
                  </div>

                  {/* Recent Transactions */}
                  <div>
                    <h3 className="text-lg font-medium text-primary dark:text-white mb-3">
                      Recent Transactions
                    </h3>
                    {transactions.length > 0 ? (
                      <div className="space-y-2">
                        {transactions.slice(0, 3).map((transaction, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <span className="text-primary dark:text-white font-medium">
                              {transaction.description}
                            </span>
                            <span className={`text-sm font-medium ${
                              transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ${transaction.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-secondary dark:text-gray-400">
                        No transactions found.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Domains Tab */}
              {activeTab === 'domains' && (
                <div>
                  <h2 className="text-xl font-semibold text-primary dark:text-white mb-4">
                    My Domains
                  </h2>
                  {domains.length > 0 ? (
                    <div className="space-y-3">
                      {domains.map((domain, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div>
                            <h3 className="font-medium text-primary dark:text-white">
                              {domain.name}
                            </h3>
                            <p className="text-sm text-secondary dark:text-gray-400">
                              Expires: {new Date(domain.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="btn-outline text-sm">
                              Manage
                            </button>
                            <button className="btn-teal text-sm">
                              Renew
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-secondary dark:text-gray-400 mb-4">
                        You don't have any domains yet.
                      </p>
                      <a href="/" className="btn-blue">
                        Register Your First Domain
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Wallet Tab */}
              {activeTab === 'wallet' && (
                <div>
                  <h2 className="text-xl font-semibold text-primary dark:text-white mb-4">
                    Wallet
                  </h2>
                  <div className="bg-tealdark text-white rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium mb-2">Current Balance</h3>
                    <p className="text-3xl font-bold">${walletBalance.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-4">
                    <button className="btn-blue">
                      Add Funds
                    </button>
                    <button className="btn-outline">
                      View History
                    </button>
                  </div>
                </div>
              )}

              {/* Transactions Tab */}
              {activeTab === 'transactions' && (
                <div>
                  <h2 className="text-xl font-semibold text-primary dark:text-white mb-4">
                    Transaction History
                  </h2>
                  {transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div>
                            <h3 className="font-medium text-primary dark:text-white">
                              {transaction.description}
                            </h3>
                            <p className="text-sm text-secondary dark:text-gray-400">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`font-medium ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${transaction.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary dark:text-gray-400">
                      No transactions found.
                    </p>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-primary dark:text-white mb-4">
                    Profile Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary dark:text-white mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.firstName || ''}
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary dark:text-white mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.lastName || ''}
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary dark:text-white mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        className="input-field w-full"
                        disabled
                      />
                    </div>
                    <button className="btn-blue">
                      Update Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard; 